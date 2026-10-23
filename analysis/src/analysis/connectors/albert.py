"""Connector to Albert (Etalab's LLM API) — embeddings and chat completions.

Two capabilities, both used by the L2 pipeline:

* :func:`embed_texts` — batched embeddings (``analysis.l2.build_docs`` for
  documents, ``analysis.l2.extract_facets`` for facets, ``analysis.l2.embed_questions``
  for questions). Same model/space across all three, which is what makes their
  embeddings comparable in ``analysis.l2.signatures``.
* :class:`AlbertClient` — chat completions, used by ``analysis.l2.extract_facets``
  to extract salience-scored facets from a document.
"""

from __future__ import annotations

import math
from collections.abc import Sequence

import httpx
import numpy as np
import pandas as pd

from analysis.config import AlbertSettings

DEFAULT_EMBEDDING_BATCH_SIZE = 64


def _batches(elements: Sequence[str], batch_size: int) -> list[Sequence[str]]:
    n_batches = math.ceil(len(elements) / batch_size)
    return [elements[i * batch_size : (i + 1) * batch_size] for i in range(n_batches)]


def get_embeddings(
    texts: Sequence[str], settings: AlbertSettings, *, timeout: float = 60.0
) -> pd.DataFrame:
    """Embed one batch of texts. Returns a DataFrame indexed by ``texts``."""
    response = httpx.post(
        f"{settings.albert_api_url}/v1/embeddings",
        headers={"Authorization": f"Bearer {settings.albert_api_key}"},
        json={"model": settings.albert_embeddings_model, "input": list(texts)},
        timeout=timeout,
    )
    response.raise_for_status()
    result = response.json()
    if len(result["data"]) != len(texts):
        raise RuntimeError(
            f"Albert returned {len(result['data'])} embeddings for {len(texts)} inputs."
        )
    return pd.DataFrame(
        np.array([item["embedding"] for item in result["data"]]), index=list(texts)
    )


def embed_texts(
    texts: Sequence[str],
    settings: AlbertSettings | None = None,
    *,
    batch_size: int = DEFAULT_EMBEDDING_BATCH_SIZE,
    lowercase: bool = True,
) -> pd.DataFrame:
    """Embed every text (in batches), preserving input order and duplicates.

    Texts are lowercased by default to match how the rest of the pipeline
    looks embeddings up (case-insensitive). Duplicates are embedded once each
    time they appear — the caller (e.g. facet embedding, which repeats a lot
    of short phrases across documents) is responsible for de-duplicating the
    *result* if it wants to save memory, via
    ``result[~result.index.duplicated(keep="first")]``.
    """
    settings = settings or AlbertSettings()
    formatted = [t.lower() for t in texts] if lowercase else list(texts)
    return pd.concat(
        [get_embeddings(batch, settings) for batch in _batches(formatted, batch_size)]
    )


def strip_code_fences(raw: str) -> str:
    """Strip a ```json ... ``` fence a chat model sometimes wraps its answer in."""
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```")[1]
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[len("json") :]
        cleaned = cleaned.strip()
    return cleaned


class AlbertClient:
    """Thin synchronous wrapper around Albert's chat-completions endpoint."""

    def __init__(self, settings: AlbertSettings | None = None) -> None:
        self._settings = settings or AlbertSettings()

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._settings.albert_api_key}",
            "Content-Type": "application/json",
        }

    def generate(self, prompt: str, *, timeout: float = 60.0) -> str:
        """Send ``prompt`` as the sole user message and return the reply text."""
        response = httpx.post(
            f"{self._settings.albert_api_url}/v1/chat/completions",
            headers=self._headers(),
            json={
                "model": self._settings.albert_llm_model,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=timeout,
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
