"""L2 pipeline, extra stage: heteroclite cross-links, ranked by canonical facet overlap.

For every document of one source (default ``fiches_service_public``),
recommends both **complementary L2 classes** (use case 2) and **specific
documents** from other sources (default ``modeles_de_courriers``,
``contributions``, ``outils``) -- then ranks the two candidate types
*together*, on a common scale, so you can see the most compelling cross-link
for a page regardless of whether it's a whole category or a single document.

Comparing them isn't trivial: an L2 candidate's embedding similarity is
doc-vs-*signature* (a blended centroid over many documents), a document
candidate's is doc-vs-*doc* -- different scales, not directly comparable.
Requires ``facets.csv`` to already carry a ``canonical_facet`` column (run
``l2 facets canonicalize`` first): the number of **shared canonical
facets** between the source document and a candidate is computed exactly
the same way whichever type the candidate is, so both types end up with
the same four ingredients -- ``n_shared_canonical_facets`` (exact concept
overlap), ``is_document``, ``source_affinity`` (does the candidate share
the source's own L2, or failing that, its L1 -- L2 candidates get a fixed
neutral value here since one can never share the source's own L2 by
construction, see :func:`source_affinity`), and ``embedding_similarity``
-- blended into one ranking number by :func:`combined_score`: a plain
weighted sum (``--weight-overlap``/``--weight-is-document``/
``--weight-source-affinity``/``--weight-similarity``), so a candidate
slightly behind on one ingredient can still win on the others instead of
losing outright to a strict priority order. Every ingredient stays
visible in its own column *and* the resulting ``combined_score`` is
exported too, so any row's rank is directly recomputable from what's
already there -- weights, not opacity, are the only thing not fully
"exact" about it, and are exactly the coefficients a future logistic
regression over logged usage could re-fit.

For each candidate type, a wider pool (``--l2-pool``/``--doc-pool``) is
gathered by embedding similarity first (cheap, high recall even across
paraphrases), then narrowed to the requested quota
(``--l2-top-k``/``--doc-top-k``) by the same :func:`combined_score`. For
document candidates, that first-pass similarity is ``--similarity-metric
doc`` (whole-document embedding, the default) or ``facet`` (single
highest facet-to-facet match) -- the latter rescues a candidate whose
match is diluted inside a long, multi-topic source document's own
embedding; see :func:`rank_document_candidates`.

Output: ``{source}_links.json`` only (see :func:`to_links_json`) -- one object
per source document, each with a ``links`` array carrying both candidate types
(``candidate_type`` = ``document`` or ``l2``) and every scoring ingredient
(confidence, combined score and rank, shared canonical facets, similarity).
Internally the table is one row per ``(source document, candidate)``. Every
source document appears at least once, including one that matched nothing in
either pool (``confidence="no_candidates"``) -- silently dropping it would look
identical to it never having been processed at all. ``source_l2``/``source_l1``
carry the document's own current classification.

To feed the tagging UI, build its payload from this file with
``l2 links payload``.

Run it::

    uv run l2 links recommend \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/facets.csv \\
        analysis/output/l2/l2_l1.json

No credentials needed -- pure computation over already-computed embeddings
and canonical facets.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
from tqdm import tqdm

from analysis.l2 import io
from analysis.l2.config import (
    DEFAULT_DOC_POOL,
    DEFAULT_DOC_TOP_K,
    DEFAULT_FACET_BASIS,
    DEFAULT_FACET_MATCH_THRESHOLD,
    DEFAULT_L2_POOL,
    DEFAULT_L2_TOP_K,
    DEFAULT_MIN_SIMILARITY,
    DEFAULT_SCORE_WEIGHTS,
    DEFAULT_SIMILARITY_METRIC,
    DEFAULT_SOURCE,
    DEFAULT_TARGET_SOURCES,
    DOCUMENT_SIMILARITY_METRICS,
    FACET_BASES,
)
from analysis.l2.facet_index import (
    build_doc_facet_index,
)
from analysis.l2.links.candidates import (
    rank_complementary_l2_candidates,
    rank_document_candidates,
)
from analysis.l2.links.render import to_links_json
from analysis.l2.links.scoring import (
    NO_CANDIDATES,
    build_doc_canonical_profiles,
    build_l2_canonical_profiles,
    combined_score,
    confidence_tier,
    facet_basis_column,
)
from analysis.l2.paths import OUTPUT_DIR
from analysis.l2.signatures.core import (
    build_l2_signatures,
    l2_normalize,
    stack_embeddings,
)

_OUTPUT_COLUMNS = [
    "source_doc_id",
    "source_title",
    "source_slug",
    "source_source",
    "source_l2",
    "source_l1",
    "source_canonical_facets",
    "candidate_type",
    "combined_rank",
    "rank_within_type",
    "confidence",
    "candidate_id",
    "candidate_label",
    "candidate_slug",
    "candidate_source",
    "candidate_l2",
    "candidate_l1",
    "source_affinity",
    "n_shared_canonical_facets",
    "shared_canonical_facets",
    "embedding_similarity",
    "combined_score",
]


# --------------------------------------------------------------------------- #
# Orchestration
# --------------------------------------------------------------------------- #


def build_links_table(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    l2_to_l1: dict[str, str],
    *,
    source: str = DEFAULT_SOURCE,
    target_sources: tuple[str, ...] = DEFAULT_TARGET_SOURCES,
    l2_pool: int = DEFAULT_L2_POOL,
    l2_top_k: int = DEFAULT_L2_TOP_K,
    doc_pool: int = DEFAULT_DOC_POOL,
    doc_top_k: int = DEFAULT_DOC_TOP_K,
    min_similarity: float = DEFAULT_MIN_SIMILARITY,
    doc_id_col: str = "id",
    l2_col: str = "l2",
    source_col: str = "source",
    embedding_col: str = "embedding",
    similarity_metric: str = DEFAULT_SIMILARITY_METRIC,
    facet_basis: str = DEFAULT_FACET_BASIS,
    facet_match_threshold: float = DEFAULT_FACET_MATCH_THRESHOLD,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> pd.DataFrame:
    """One row per ``(source document, candidate)``, both types ranked together.

    See the module docstring for the overlap-first, embedding-as-tiebreaker
    ranking rationale. ``similarity_metric`` controls how *document*
    candidates (not L2 candidates) are gated/ranked before that overlap
    reranking -- see :func:`rank_document_candidates`. ``facet_basis``
    controls what counts as "the same facet" for that overlap itself
    (``n_shared_canonical_facets``) -- see :func:`facet_basis_column`.
    ``weights`` controls how that overlap, ``is_document``,
    ``source_affinity``, and ``embedding_similarity`` blend into the one
    ``combined_score`` both pools are ultimately ranked by together -- see
    :func:`combined_score`.
    """
    canonical_col = facet_basis_column(facet_basis)
    doc_to_l2 = docs_df.set_index(doc_id_col)[l2_col].to_dict()

    print("⏳ Building L2 signatures…", flush=True)
    signatures = build_l2_signatures(
        docs_df, facets_df, l2_to_l1, doc_id_col=doc_id_col, l2_col=l2_col
    )

    # L2-candidate overlap always needs this (canonical_facet, falling back
    # from "embedding" -- see facet_basis_column); DOCUMENT-candidate
    # overlap only uses it when facet_basis isn't "embedding" (below).
    print(f"⏳ Building {facet_basis} facet profiles…", flush=True)
    doc_profiles = build_doc_canonical_profiles(facets_df, canonical_col=canonical_col)
    l2_profiles = build_l2_canonical_profiles(
        facets_df, doc_to_l2, canonical_col=canonical_col
    )

    doc_facet_index = None
    if similarity_metric == "facet" or facet_basis == "embedding":
        print("⏳ Building facet index for facet-level comparisons…", flush=True)
        doc_facet_index = build_doc_facet_index(facets_df)

    relevant = docs_df[docs_df[source_col].isin((source, *target_sources))]
    doc_ids = relevant[doc_id_col].tolist()
    doc_index = {d: i for i, d in enumerate(doc_ids)}
    doc_matrix = l2_normalize(stack_embeddings(relevant[embedding_col]))
    is_candidate = relevant[source_col].isin(target_sources).to_numpy()
    metadata = relevant.set_index(doc_id_col)[["title", "slug", source_col]]

    source_docs = relevant[relevant[source_col] == source]

    tables: list[pd.DataFrame] = []
    for row in tqdm(
        source_docs.itertuples(), total=len(source_docs), desc="Building links"
    ):
        doc_id = getattr(row, doc_id_col)
        own_l2 = getattr(row, l2_col)
        own_l1 = l2_to_l1.get(own_l2, "")
        doc_embedding = np.asarray(getattr(row, embedding_col), dtype=float)
        doc_profile = doc_profiles.get(doc_id, {})

        l2_candidates = rank_complementary_l2_candidates(
            doc_embedding,
            own_l2,
            signatures,
            doc_profile,
            l2_profiles,
            l2_to_l1,
            pool_size=l2_pool,
            top_k=l2_top_k,
            min_similarity=min_similarity,
            weights=weights,
        )
        if not l2_candidates.empty:
            l2_candidates["candidate_type"] = "l2"

        doc_candidates = rank_document_candidates(
            doc_id,
            doc_matrix,
            doc_ids,
            doc_index,
            is_candidate,
            metadata,
            doc_profiles,
            doc_to_l2,
            own_l2,
            own_l1,
            l2_to_l1,
            pool_size=doc_pool,
            top_k=doc_top_k,
            min_similarity=min_similarity,
            similarity_metric=similarity_metric,
            doc_facet_index=doc_facet_index,
            facet_basis=facet_basis,
            facet_match_threshold=facet_match_threshold,
            weights=weights,
        )
        if not doc_candidates.empty:
            doc_candidates["candidate_type"] = "document"

        combined = pd.concat([l2_candidates, doc_candidates], ignore_index=True)
        if combined.empty:
            # Still one row per source document -- a doc that matched
            # nothing (in either pool, after the min_similarity floor) is
            # exactly the kind of thing a reviewer needs to see, not have
            # silently disappear from the export.
            combined = pd.DataFrame([{"confidence": NO_CANDIDATES}])
        else:
            # Rank both types together by the one blended score -- see
            # combined_score. Kept as its own "combined_score" column
            # (not dropped) so a reviewer can verify any row's rank
            # directly from the other, already-visible columns.
            combined["combined_score"] = combined.apply(
                lambda r: combined_score(
                    r["n_shared_canonical_facets"],
                    r["candidate_type"] == "document",
                    r["source_affinity"],
                    r["embedding_similarity"],
                    weights=weights,
                ),
                axis=1,
            )
            combined = combined.sort_values(
                "combined_score", ascending=False
            ).reset_index(drop=True)
            combined["rank_within_type"] = (
                combined.groupby("candidate_type").cumcount() + 1
            )
            combined["combined_rank"] = combined.index + 1
            combined["confidence"] = combined["n_shared_canonical_facets"].apply(
                confidence_tier
            )

        own_canonical_facets = ", ".join(
            facet
            for facet, _ in sorted(
                doc_profile.items(), key=lambda kv: kv[1], reverse=True
            )
        )

        combined.insert(0, "source_doc_id", doc_id)
        combined.insert(1, "source_title", row.title)
        combined.insert(2, "source_slug", row.slug)
        combined.insert(3, "source_source", source)
        combined.insert(4, "source_l2", own_l2)
        combined.insert(5, "source_l1", l2_to_l1.get(own_l2, ""))
        combined.insert(6, "source_canonical_facets", own_canonical_facets)
        tables.append(combined)

    if not tables:
        return pd.DataFrame(columns=_OUTPUT_COLUMNS)
    return pd.concat(tables, ignore_index=True).reindex(columns=_OUTPUT_COLUMNS)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument(
        "facets", type=Path, help="path to facets.csv (must have canonical_facet)"
    )
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument(
        "--source",
        default=DEFAULT_SOURCE,
        help=f"source to build links for (default: {DEFAULT_SOURCE})",
    )
    parser.add_argument(
        "--target-source",
        action="append",
        dest="target_sources",
        default=None,
        help="candidate source for document links (repeatable; "
        f"default: {', '.join(DEFAULT_TARGET_SOURCES)})",
    )
    parser.add_argument("--l2-top-k", type=int, default=DEFAULT_L2_TOP_K)
    parser.add_argument("--l2-pool", type=int, default=DEFAULT_L2_POOL)
    parser.add_argument("--doc-top-k", type=int, default=DEFAULT_DOC_TOP_K)
    parser.add_argument("--doc-pool", type=int, default=DEFAULT_DOC_POOL)
    parser.add_argument(
        "--min-similarity",
        type=float,
        default=DEFAULT_MIN_SIMILARITY,
        help=f"embedding-similarity floor for a candidate to enter the pool "
        f"(default: {DEFAULT_MIN_SIMILARITY})",
    )
    parser.add_argument(
        "--similarity-metric",
        choices=DOCUMENT_SIMILARITY_METRICS,
        default=DEFAULT_SIMILARITY_METRIC,
        help="how DOCUMENT candidates (not L2 candidates) are gated/ranked "
        "before canonical-facet-overlap reranking: whole-document embedding "
        "cosine similarity (default), or the single highest facet-to-facet "
        "cosine similarity between the two documents -- rescues a candidate "
        "whose match is diluted in a long source document's whole-document "
        f"vector (default: {DEFAULT_SIMILARITY_METRIC})",
    )
    parser.add_argument(
        "--facet-basis",
        choices=FACET_BASES,
        default=DEFAULT_FACET_BASIS,
        help='what counts as "the same facet" for n_shared_canonical_facets: '
        "the clustered canonical_facet column from l2 facets canonicalize "
        "(default, credits paraphrases but depends on that clustering step), "
        "the literal per-document text (exact wording only, no clustering "
        "step needed), or greedy embedding matching between the two "
        "documents' own facets (DOCUMENT candidates only -- credits "
        "paraphrases like canonical, but per candidate pair instead of "
        f"corpus-wide clustering) (default: {DEFAULT_FACET_BASIS})",
    )
    parser.add_argument(
        "--facet-match-threshold",
        type=float,
        default=DEFAULT_FACET_MATCH_THRESHOLD,
        help="cosine-similarity floor for --facet-basis embedding's greedy "
        f"facet matching (default: {DEFAULT_FACET_MATCH_THRESHOLD})",
    )
    parser.add_argument(
        "--weight-overlap",
        type=float,
        default=DEFAULT_SCORE_WEIGHTS["n_shared_canonical_facets"],
        help="combined_score coefficient on n_shared_canonical_facets "
        f"(default: {DEFAULT_SCORE_WEIGHTS['n_shared_canonical_facets']})",
    )
    parser.add_argument(
        "--weight-is-document",
        type=float,
        default=DEFAULT_SCORE_WEIGHTS["is_document"],
        help="combined_score coefficient on is_document "
        f"(default: {DEFAULT_SCORE_WEIGHTS['is_document']})",
    )
    parser.add_argument(
        "--weight-source-affinity",
        type=float,
        default=DEFAULT_SCORE_WEIGHTS["source_affinity"],
        help="combined_score coefficient on source_affinity "
        f"(default: {DEFAULT_SCORE_WEIGHTS['source_affinity']})",
    )
    parser.add_argument(
        "--weight-similarity",
        type=float,
        default=DEFAULT_SCORE_WEIGHTS["embedding_similarity"],
        help="combined_score coefficient on embedding_similarity "
        f"(default: {DEFAULT_SCORE_WEIGHTS['embedding_similarity']})",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=OUTPUT_DIR,
        help="output directory for {source}_links.json",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    target_sources = (
        tuple(args.target_sources) if args.target_sources else DEFAULT_TARGET_SOURCES
    )

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)

    weights = {
        "n_shared_canonical_facets": args.weight_overlap,
        "is_document": args.weight_is_document,
        "source_affinity": args.weight_source_affinity,
        "embedding_similarity": args.weight_similarity,
    }

    table = build_links_table(
        docs_df,
        facets_df,
        l2_to_l1,
        source=args.source,
        target_sources=target_sources,
        l2_pool=args.l2_pool,
        l2_top_k=args.l2_top_k,
        doc_pool=args.doc_pool,
        doc_top_k=args.doc_top_k,
        min_similarity=args.min_similarity,
        similarity_metric=args.similarity_metric,
        facet_basis=args.facet_basis,
        facet_match_threshold=args.facet_match_threshold,
        weights=weights,
    )

    args.out.mkdir(parents=True, exist_ok=True)

    links_json = to_links_json(table)
    json_path = args.out / f"{args.source}_links.json"
    json_path.write_text(
        json.dumps(links_json, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    n_docs = table["source_doc_id"].nunique() if not table.empty else 0
    print(f"\n✓ {len(table)} candidate links across {n_docs} {args.source} documents")
    print(f"✓ {json_path}")

    if n_docs:
        n_no_candidates = table.loc[
            table["confidence"] == NO_CANDIDATES, "source_doc_id"
        ].nunique()
        pct_no_candidates = 100 * n_no_candidates / n_docs
        print(
            f"⚠ {n_no_candidates}/{n_docs} documents ({pct_no_candidates:.1f}%) "
            "have no recommended link at all"
        )


if __name__ == "__main__":
    main()
