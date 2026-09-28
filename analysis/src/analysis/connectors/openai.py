"""Connector to the OpenAI API — embeddings only.

Raw HTTP via ``httpx`` (already a project dependency), not the ``openai``
SDK. ``embed_texts`` matches
:func:`analysis.connectors.albert.embed_texts`'s signature and batching/
lowercasing/dedup contract, so the two are interchangeable at call sites
that build ``docs_df``/``facets_df`` embeddings for the L2 pipeline.

Docs: https://platform.openai.com/docs/api-reference/embeddings
"""

from __future__ import annotations

import math
from collections.abc import Sequence

import httpx
import numpy as np
import pandas as pd

from analysis.config import OpenAISettings

_API_URL = "https://api.openai.com/v1/embeddings"
DEFAULT_EMBEDDING_BATCH_SIZE = 64


def _batches(elements: Sequence[str], batch_size: int) -> list[Sequence[str]]:
    n_batches = math.ceil(len(elements) / batch_size)
    return [elements[i * batch_size : (i + 1) * batch_size] for i in range(n_batches)]


def get_embeddings(
    texts: Sequence[str], settings: OpenAISettings, *, timeout: float = 60.0
) -> pd.DataFrame:
    """Embed one batch of texts. Returns a DataFrame indexed by ``texts``."""
    response = httpx.post(
        _API_URL,
        headers={
            "authorization": f"Bearer {settings.openai_api_key}",
            "content-type": "application/json",
        },
        json={"model": settings.openai_embeddings_model, "input": list(texts)},
        timeout=timeout,
    )
    if response.is_error:
        # raise_for_status() alone drops the response body, which is where
        # OpenAI puts the actually useful part of a 4xx --
        # e.g. {"error": {"message": "...", "type": "invalid_request_error"}}.
        raise httpx.HTTPStatusError(
            f"{response.status_code} {response.reason_phrase} calling "
            f"{_API_URL}: {response.text}",
            request=response.request,
            response=response,
        )
    data = response.json()["data"]
    if len(data) != len(texts):
        raise RuntimeError(
            f"OpenAI returned {len(data)} embeddings for {len(texts)} inputs."
        )
    # Ordered by "index" rather than trusted as already-in-order -- cheap
    # insurance the API contract itself documents as necessary.
    ordered = sorted(data, key=lambda item: item["index"])
    return pd.DataFrame(
        np.array([item["embedding"] for item in ordered]), index=list(texts)
    )


def embed_texts(
    texts: Sequence[str],
    settings: OpenAISettings | None = None,
    *,
    batch_size: int = DEFAULT_EMBEDDING_BATCH_SIZE,
    lowercase: bool = True,
) -> pd.DataFrame:
    """Embed every text (in batches), preserving input order and duplicates.

    Same contract as :func:`analysis.connectors.albert.embed_texts`: texts
    are lowercased by default, and duplicates are embedded once per
    occurrence -- the caller de-duplicates the *result* if it wants to, via
    ``result[~result.index.duplicated(keep="first")]``.
    """
    settings = settings or OpenAISettings()
    formatted = [t.lower() for t in texts] if lowercase else list(texts)
    return pd.concat(
        [get_embeddings(batch, settings) for batch in _batches(formatted, batch_size)]
    )
