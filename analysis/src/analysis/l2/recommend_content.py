"""L2 pipeline, extra stage: cross-source content recommendations.

For every document of one source (default ``fiches_service_public``), finds
the most relevant documents among a fixed set of other sources (default
``modeles_de_courriers``, ``contributions``, ``outils``) -- e.g. "which
modèles de courriers / contributions / outils should this fiche link to?".

Unlike :mod:`analysis.l2.use_cases` (which ranks whole L2 *classes* against
each other), this ranks individual *documents* directly: whole-document
embedding cosine similarity picks the candidates, then the same
facet-embeddings-per-document indexing used for L2 complementarity
(:func:`analysis.l2.use_cases.build_doc_facet_index`) explains each pick
with the specific facet pair behind it. A single pooled top-N across every
target source, not top-N per source -- capped at ``top_n`` and floored at a
0.75 cosine similarity, so a document with no genuinely close match gets
fewer (or zero) recommendations rather than padded-in weak ones.

No L2 signatures needed here -- just ``docs.csv``/``facets.csv``.

These are **drafts for editorial review**, not links to publish automatically
-- output is one row per source document (id, title, slug, recommendations)
as ``.xlsx``, same review-first convention as the rest of the pipeline.

Run it::

    uv run l2-recommend-content \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/facets.csv

No credentials needed -- pure computation over the artifacts already pulled
by the earlier stages.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

from analysis.l2 import io
from analysis.l2.signatures import l2_normalize, stack_embeddings
from analysis.l2.use_cases import build_doc_facet_index

RECOMMEND_FOR_SOURCE = "fiches_service_public"
TARGET_SOURCES: tuple[str, ...] = ("modeles_de_courriers", "contributions", "outils")


def facet_bridge_for_pair(
    source_doc_id, target_doc_id, doc_facet_index: dict, top_n: int = 3
) -> list[dict]:
    """Best-matching facet pairs between two specific documents' own facets.

    Simpler than :func:`analysis.l2.use_cases.facet_bridge_pairs`: that one
    matches a document against every facet in a whole L2 class, this one
    matches two documents' handful of facets against each other directly --
    no dedup-across-many-documents bookkeeping needed at this scale.
    """
    own = doc_facet_index.get(source_doc_id)
    other = doc_facet_index.get(target_doc_id)
    if (
        not own
        or not other
        or len(own["embeddings"]) == 0
        or len(other["embeddings"]) == 0
    ):
        return []

    sims = own["embeddings"] @ other["embeddings"].T
    flat_order = np.argsort(sims.ravel())[::-1][:top_n]
    results = []
    for flat_idx in flat_order:
        i, j = np.unravel_index(flat_idx, sims.shape)
        results.append(
            {
                "own_facet": own["texts"][i],
                "matched_facet": other["texts"][j],
                "similarity": float(sims[i, j]),
            }
        )
    return results


def add_recommendations(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    *,
    recommend_for: str = RECOMMEND_FOR_SOURCE,
    target_sources: tuple[str, ...] = TARGET_SOURCES,
    source_col: str = "source",
    doc_id_col: str = "id",
    embedding_col: str = "embedding",
    top_n: int = 3,
    bridge_top_n: int = 3,
    min_similarity: float = 0.75,
) -> pd.DataFrame:
    """One row per ``recommend_for`` document, with a pooled top-N ``recommendations``.

    Each entry is ``{doc_id, title, slug, source, similarity, bridge}``,
    ranked by whole-document embedding similarity across every
    ``target_sources`` document together (not top-N per source). Candidates
    below ``min_similarity`` are dropped even if fewer than ``top_n`` remain
    -- a document with no genuinely close match gets an empty list rather
    than its least-bad options padded in.
    """
    relevant = docs_df[docs_df[source_col].isin((recommend_for, *target_sources))]
    doc_ids = relevant[doc_id_col].tolist()
    doc_index = {doc_id: i for i, doc_id in enumerate(doc_ids)}
    doc_matrix = l2_normalize(stack_embeddings(relevant[embedding_col]))
    is_candidate = relevant[source_col].isin(target_sources).to_numpy()
    metadata = relevant.set_index(doc_id_col)[["title", "slug", source_col]]

    relevant_facets = facets_df[facets_df["doc_id"].isin(doc_ids)]
    doc_facet_index = build_doc_facet_index(relevant_facets)

    source_docs = relevant[relevant[source_col] == recommend_for]
    recommendations = []
    for doc_id in source_docs[doc_id_col]:
        sims = doc_matrix @ doc_matrix[doc_index[doc_id]]
        sims = np.where(is_candidate, sims, -np.inf)
        ranked_idx = np.argsort(sims)[::-1][:top_n]

        entries = []
        for j in ranked_idx:
            if not np.isfinite(sims[j]) or sims[j] < min_similarity:
                break  # sorted descending -- nothing further clears the bar either
            target_id = doc_ids[j]
            row = metadata.loc[target_id]
            entries.append(
                {
                    "doc_id": target_id,
                    "title": row["title"],
                    "slug": row["slug"],
                    "source": row[source_col],
                    "similarity": float(sims[j]),
                    # "bridge": facet_bridge_for_pair(
                    #     doc_id, target_id, doc_facet_index, bridge_top_n
                    # ),
                }
            )
        recommendations.append(entries)

    out = source_docs.copy()
    out["recommendations"] = recommendations
    return out


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument("facets", type=Path, help="path to facets.csv")
    parser.add_argument(
        "--recommend-for",
        default=RECOMMEND_FOR_SOURCE,
        help=f"source to recommend for (default: {RECOMMEND_FOR_SOURCE})",
    )
    parser.add_argument(
        "--target-source",
        action="append",
        dest="target_sources",
        default=None,
        help="candidate source to recommend from (repeatable; "
        f"default: {', '.join(TARGET_SOURCES)})",
    )
    parser.add_argument(
        "--top-n",
        type=int,
        default=5,
        help="pooled recommendations per document (default: 5)",
    )
    parser.add_argument(
        "--bridge-top-n",
        type=int,
        default=3,
        help="facet-bridge pairs per recommendation (default: 3)",
    )
    parser.add_argument(
        "--min-similarity",
        type=float,
        default=0.75,
        help="drop candidates below this cosine similarity (default: 0.75)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[3] / "output" / "l2",
        help="output directory for the review .xlsx file",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    target_sources = (
        tuple(args.target_sources) if args.target_sources else TARGET_SOURCES
    )

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)

    print(
        f"⏳ Recommending {', '.join(target_sources)} "
        f"for every {args.recommend_for} document…",
        flush=True,
    )
    result = add_recommendations(
        docs_df,
        facets_df,
        recommend_for=args.recommend_for,
        target_sources=target_sources,
        top_n=args.top_n,
        bridge_top_n=args.bridge_top_n,
        min_similarity=args.min_similarity,
    )
    print(f"✓ {len(result)} {args.recommend_for} documents processed", flush=True)

    args.out.mkdir(parents=True, exist_ok=True)
    out_path = args.out / f"{args.recommend_for}_recommendations.xlsx"
    result[["id", "title", "slug", "recommendations"]].to_excel(out_path, index=False)
    print(f"✓ {out_path}")


if __name__ == "__main__":
    main()
