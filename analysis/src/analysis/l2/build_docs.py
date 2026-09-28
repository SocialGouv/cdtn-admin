"""L2 pipeline, stage 1: Elasticsearch -> documents dataset.

Pulls every published, searchable document from the cdtn-search Elasticsearch
cluster, embeds it (OpenAI), and derives its L2 (sub-theme) / L1 (theme) labels
from its breadcrumbs. L2s with too few member documents ("quasi-orphans" — a
handful of stray/legacy documents rather than a real editorial category) are
dropped, since :mod:`analysis.l2.signatures` cannot build a meaningful
signature from 1-2 documents.

Output: ``docs.csv`` (id, title, text, slug, source, breadcrumbs,
embedding, l2) and ``l2_l1.json`` (``{l2: l1}``), consumed by every later
stage. See the package docstring (:mod:`analysis.l2`) for the full pipeline.

**Embedding space warning**: :mod:`analysis.l2.extract_facets` and
:mod:`analysis.l2.embed_questions` still embed via Albert. Every downstream
step (:mod:`analysis.l2.signatures`, ``describe_classes``, ``recommend_content``)
computes cosine similarity between docs and facets/questions, which is only
meaningful if they share one embedding space -- regenerate ``facets.csv``/
``questions.csv`` with the same provider as ``docs.csv`` before running
anything downstream.

Run it::

    uv run python -m analysis.l2.build_docs
    uv run python -m analysis.l2.build_docs --out analysis/output/l2 --min-docs-per-l2 2

Needs ``ELASTICSEARCH_SEARCH_ENGINE_*`` and ``OPENAI_*`` settings in ``.env``.
"""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Any

import pandas as pd

from analysis.connectors.elasticsearch import ElasticsearchDocsConnector
from analysis.connectors.openai import embed_texts
from analysis.l2 import io

# Titre + texte, tronqués -- même fenêtre que le modèle d'embeddings tolère
# confortablement, et cohérente avec le texte utilisé pour l'extraction de
# facettes (analysis.l2.extract_facets).
_MAX_CHARS = 8192


def format_for_embedding(doc: dict[str, Any]) -> str:
    """Title + text, the way the embedding model sees a document."""
    return f"Titre : {doc['title']} \n Contenu : {doc['text']}"[:_MAX_CHARS]
    # return f"Titre : {doc['title']}"[:_MAX_CHARS]


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
    embeddings = embed_texts([format_for_embedding(d) for d in raw_docs])
    docs_df["embedding"] = embeddings.apply(list, axis=1).values
    return assign_l2_l1(docs_df, min_docs_per_l2=min_docs_per_l2)


def reembed_docs(docs_df: pd.DataFrame) -> pd.DataFrame:
    """Recompute every row's ``embedding`` via :func:`format_for_embedding`,
    keeping title/text/breadcrumbs/l2/... untouched.

    For when ``format_for_embedding``'s recipe changes and an existing
    ``docs.csv``'s stored embeddings need to catch up -- no Elasticsearch
    pull, no facet re-extraction (facets are already built from the full
    title+text, so they're unaffected either way).
    """
    docs_df = docs_df.copy()
    texts = [format_for_embedding(row) for row in docs_df.to_dict("records")]
    embeddings = embed_texts(texts)
    docs_df["embedding"] = embeddings.apply(list, axis=1).values
    return docs_df


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[3] / "output" / "l2",
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
        "column for an existing docs.csv (e.g. after format_for_embedding's "
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
