"""L2 pipeline, stage 1: Elasticsearch -> documents dataset.

Pulls every published, searchable document from the cdtn-search Elasticsearch
cluster, embeds it (OpenAI), and derives its L2 (sub-theme) / L1 (theme) labels
from its breadcrumbs. L2s with too few member documents ("quasi-orphans" — a
handful of stray/legacy documents rather than a real editorial category) are
dropped, since :mod:`analysis.l2.signatures.core` cannot build a meaningful
signature from 1-2 documents.

Output: ``docs.csv`` (id, title, text, slug, source, breadcrumbs,
embedding, l2) and ``l2_l1.json`` (``{l2: l1}``), consumed by every later
stage. See the package docstring (:mod:`analysis.l2`) for the full pipeline.

**Embedding space warning**: :mod:`analysis.l2.facets.extract` and
:mod:`analysis.l2.questions.embed` still embed via Albert. Every downstream
step (:mod:`analysis.l2.signatures.core`, ``describe_classes``, ``recommend_content``)
computes cosine similarity between docs and facets/questions, which is only
meaningful if they share one embedding space -- regenerate ``facets.csv``/
``questions.csv`` with the same provider as ``docs.csv`` before running
anything downstream.

Run it::

    uv run python -m analysis.l2.docs.build
    uv run python -m analysis.l2.docs.build --out analysis/output/l2 --min-docs-per-l2 2

Needs ``ELASTICSEARCH_SEARCH_ENGINE_*`` and ``OPENAI_*`` settings in ``.env``.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

from analysis.connectors.elasticsearch import ElasticsearchDocsConnector
from analysis.connectors.openai import embed_texts
from analysis.l2 import io
from analysis.l2.config import CHUNK_CHARS as DEFAULT_CHUNK_CHARS
from analysis.l2.paths import OUTPUT_DIR

_SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!?])\s+")


def _split_to_atoms(text: str, max_len: int) -> list[str]:
    """``text`` broken into pieces each ``<= max_len``, preferring
    paragraph then sentence boundaries, falling back to a hard character
    slice if the text has neither -- verified against the real corpus:
    at least one document (115K chars) has zero newlines anywhere, so a
    paragraph-only split silently left its entire body as one chunk, well
    over the embedding model's token limit. This fallback chain
    guarantees a bounded piece size regardless of the source text's
    structure (or lack of it).
    """
    text = text.strip()
    if not text:
        return []
    if len(text) <= max_len:
        return [text]
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    if len(paragraphs) > 1:
        return [atom for p in paragraphs for atom in _split_to_atoms(p, max_len)]
    sentences = [s.strip() for s in _SENTENCE_SPLIT_RE.split(text) if s.strip()]
    if len(sentences) > 1:
        return [atom for s in sentences for atom in _split_to_atoms(s, max_len)]
    return [text[i : i + max_len] for i in range(0, len(text), max_len)]


def _pack_atoms(atoms: list[str], max_len: int) -> list[str]:
    """Greedily pack atoms (each already ``<= max_len``) into chunks up to
    ``max_len``, space-joined."""
    chunks = []
    current: list[str] = []
    current_len = 0
    for atom in atoms:
        added_len = len(atom) + (1 if current else 0)
        if current and current_len + added_len > max_len:
            chunks.append(" ".join(current))
            current, current_len = [], 0
            added_len = len(atom)
        current.append(atom)
        current_len += added_len
    if current:
        chunks.append(" ".join(current))
    return chunks


def chunk_document(
    title: str, text: str, *, chunk_chars: int = DEFAULT_CHUNK_CHARS
) -> list[str]:
    """Title (its own chunk) + text split into ``<= chunk_chars`` pieces
    and greedily repacked to that size.

    Never drops content, unlike a flat single-call
    truncation -- a document longer than one chunk just becomes several,
    all later mean-pooled into one vector by
    :func:`embed_documents_chunked`. Tolerates a missing/NaN ``title`` or
    ``text`` (seen in practice in the real corpus) by treating it as empty
    rather than raising.
    """
    atoms = _split_to_atoms(text if isinstance(text, str) else "", chunk_chars)
    title = title if isinstance(title, str) else ""
    return [f"Titre : {title}", *_pack_atoms(atoms, chunk_chars)]


def embed_documents_chunked(
    docs: list[dict[str, Any]], *, chunk_chars: int = DEFAULT_CHUNK_CHARS
) -> list[list[float]]:
    """One embedding per document, covering its full text regardless of
    length.

    Each document is split via :func:`chunk_document`, every chunk across
    every document is embedded in one flat batch (``embed_texts`` already
    batches internally), then each document's chunk vectors are mean-pooled
    and L2-renormalized back into a single vector -- same shape/usage as
    the old single-embedding-call output, so every downstream consumer
    (``rank_document_candidates``, ``build_training_pairs``, ...) is
    unchanged. Chunks are embedded positionally, not matched back by text,
    since two documents can share an identical short paragraph.
    """
    chunk_lists = [
        chunk_document(
            d.get("title") or "", d.get("text") or "", chunk_chars=chunk_chars
        )
        for d in docs
    ]
    flat = [c for chunks in chunk_lists for c in chunks]
    vectors = embed_texts(flat).to_numpy()

    out = []
    i = 0
    for chunks in chunk_lists:
        n = len(chunks)
        doc_vectors = vectors[i : i + n]
        mean_vec = doc_vectors.mean(axis=0)
        norm = np.linalg.norm(mean_vec)
        out.append((mean_vec / norm if norm > 0 else mean_vec).tolist())
        i += n
    return out


def parse_theme_slug(slug: str) -> tuple[str, str]:
    """``/themes/{l1}#{l2}`` -> ``(l1, l2)``."""
    l1, l2 = slug.split("/")[2].split("#")
    return l1, l2


def assign_l2_l1(
    docs_df: pd.DataFrame, *, min_docs_per_l2: int = 2
) -> tuple[pd.DataFrame, dict[str, str]]:
    """Derive each document's L2 label from its breadcrumbs.

    Drops documents with no theme breadcrumb, and whole L2s with
    ``<= min_docs_per_l2`` member documents ("quasi-orphans"). Keyed by the
    breadcrumb's ``slug`` (not the breadcrumb dict itself, which is not
    hashable) when counting membership.

    Returns ``(docs_df with an added 'l2' column, l2_to_l1)``, both already
    restricted to the kept documents/classes.
    """
    theme_slug = docs_df["breadcrumbs"].apply(
        lambda bc: bc[1]["slug"] if len(bc) > 1 else None
    )
    counts = theme_slug.value_counts()
    quasi_orphan_slugs = set(counts[counts <= min_docs_per_l2].index)
    keep = theme_slug.notna() & ~theme_slug.isin(quasi_orphan_slugs)

    kept: pd.DataFrame = docs_df.loc[keep].copy()
    l1_l2 = theme_slug[keep].apply(parse_theme_slug)
    kept["l2"] = [l2 for _, l2 in l1_l2]
    l2_to_l1 = dict(zip((l2 for _, l2 in l1_l2), (l1 for l1, _ in l1_l2), strict=True))
    return kept, l2_to_l1


def build_docs_df(
    raw_docs: list[dict[str, Any]], *, min_docs_per_l2: int = 2
) -> tuple[pd.DataFrame, dict[str, str]]:
    """Embed + label a batch of raw ES documents.

    See :func:`main` for the full stage.
    """
    docs_df = pd.DataFrame(raw_docs)
    docs_df["embedding"] = embed_documents_chunked(raw_docs)
    return assign_l2_l1(docs_df, min_docs_per_l2=min_docs_per_l2)


def reembed_docs(docs_df: pd.DataFrame) -> pd.DataFrame:
    """Recompute every row's ``embedding`` via :func:`embed_documents_chunked`,
    keeping title/text/breadcrumbs/l2/... untouched.

    For when the embedding recipe changes and an existing ``docs.csv``'s
    stored embeddings need to catch up -- no Elasticsearch pull, no facet
    re-extraction (facets are already built from the full title+text, so
    they're unaffected either way).
    """
    docs_df = docs_df.copy()
    docs_df["embedding"] = embed_documents_chunked(docs_df.to_dict("records"))
    return docs_df


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=Path,
        default=OUTPUT_DIR,
        help="output directory for docs.csv and l2_l1.json",
    )
    parser.add_argument(
        "--min-docs-per-l2",
        type=int,
        default=2,
        help="drop L2 classes with this many member documents or fewer (default: 2)",
    )
    parser.add_argument(
        "--reembed-from",
        type=Path,
        default=None,
        help="skip Elasticsearch entirely and just recompute the embedding "
        "column for an existing docs.csv (e.g. after the chunking "
        "recipe changes) -- overwrites that file in place, no facet "
        "re-extraction needed",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    if args.reembed_from:
        docs_df = io.load_docs(args.reembed_from)
        print(f"⏳ OpenAI: re-embedding {len(docs_df)} documents…", flush=True)
        docs_df = reembed_docs(docs_df)
        io.save_docs(docs_df, args.reembed_from)
        print(f"\n✓ {args.reembed_from}")
        return

    print("⏳ Elasticsearch: fetching documents…", flush=True)
    with ElasticsearchDocsConnector() as es:
        raw_docs = es.fetch_documents()
    print(f"✓ {len(raw_docs)} documents", flush=True)

    print("⏳ OpenAI: embedding documents…", flush=True)
    docs_df, l2_to_l1 = build_docs_df(raw_docs, min_docs_per_l2=args.min_docs_per_l2)
    print(
        f"✓ {len(docs_df)} documents kept across {len(l2_to_l1)} L2 classes "
        f"({len(raw_docs) - len(docs_df)} dropped: no theme or quasi-orphan L2)",
        flush=True,
    )

    args.out.mkdir(parents=True, exist_ok=True)
    docs_path = args.out / "docs.csv"
    l2_l1_path = args.out / "l2_l1.json"
    io.save_docs(docs_df, docs_path)
    io.save_l2_l1(l2_to_l1, l2_l1_path)
    print(f"\n✓ {docs_path}\n✓ {l2_l1_path}")


if __name__ == "__main__":
    main()
