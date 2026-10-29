"""Candidate generation for link recommendation: L2 candidates and document
candidates, each pre-ranked before the combined score merges them.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

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
)
from analysis.l2.facet_index import facet_greedy_overlap, facet_max_similarities
from analysis.l2.links.scoring import canonical_overlap, combined_score, source_affinity
from analysis.l2.signatures.core import score_against_signatures

# --------------------------------------------------------------------------- #
# Candidate pools: widen by embedding similarity, rerank by canonical overlap
# --------------------------------------------------------------------------- #


def rank_complementary_l2_candidates(
    doc_embedding: np.ndarray,
    own_l2: str,
    signatures: dict,
    doc_profile: dict[str, int],
    l2_profiles: dict[str, set[str]],
    l2_to_l1: dict[str, str],
    *,
    pool_size: int = DEFAULT_L2_POOL,
    top_k: int = DEFAULT_L2_TOP_K,
    min_similarity: float = DEFAULT_MIN_SIMILARITY,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> pd.DataFrame:
    """Top ``top_k`` complementary L2s for one document.

    Pool: every L2 above ``min_similarity``, excluding the doc's own L2 and
    any L2 *more* similar than its own (misclassification territory, not
    complementarity -- same exclusion as
    :func:`analysis.l2.facet_index.add_complementary_l2_columns_content_only`).
    Ranked by :func:`combined_score` (``is_document=False``,
    ``source_affinity="not_applicable"`` for every row here, so in practice
    this reduces to ``n_shared_canonical_facets``/``embedding_similarity``
    blended together -- those two terms are the only ones that vary within
    a pool of L2-only candidates).
    """
    ranked = score_against_signatures(doc_embedding, signatures)
    own_row = ranked.loc[ranked["l2"] == own_l2, "similarity"]
    own_similarity = float(own_row.iloc[0]) if len(own_row) else float("inf")

    pool = ranked[(ranked["l2"] != own_l2) & (ranked["similarity"] <= own_similarity)]
    pool = pool[pool["similarity"] >= min_similarity].head(pool_size)

    rows = []
    for _, r in pool.iterrows():
        n_shared, shared = canonical_overlap(
            doc_profile, l2_profiles.get(r["l2"], set())
        )
        rows.append(
            {
                "candidate_id": r["l2"],
                "candidate_label": r["l2"],
                "candidate_l2": r["l2"],
                "candidate_l1": l2_to_l1.get(r["l2"], ""),
                "source_affinity": "not_applicable",
                "embedding_similarity": float(r["similarity"]),
                "n_shared_canonical_facets": n_shared,
                "shared_canonical_facets": ", ".join(shared),
            }
        )
    pool_df = pd.DataFrame(rows)
    if pool_df.empty:
        return pool_df
    pool_df["_score"] = pool_df.apply(
        lambda r: combined_score(
            r["n_shared_canonical_facets"],
            False,
            r["source_affinity"],
            r["embedding_similarity"],
            weights=weights,
        ),
        axis=1,
    )
    return (
        pool_df.sort_values("_score", ascending=False)
        .drop(columns="_score")
        .head(top_k)
    )


def rank_document_candidates(
    doc_id: str,
    doc_matrix: np.ndarray,
    doc_ids: list[str],
    doc_index: dict[str, int],
    is_candidate: np.ndarray,
    metadata: pd.DataFrame,
    doc_profiles: dict[str, dict[str, int]],
    doc_to_l2: dict[str, str],
    own_l2: str,
    own_l1: str,
    l2_to_l1: dict[str, str],
    *,
    pool_size: int = DEFAULT_DOC_POOL,
    top_k: int = DEFAULT_DOC_TOP_K,
    min_similarity: float = DEFAULT_MIN_SIMILARITY,
    similarity_metric: str = DEFAULT_SIMILARITY_METRIC,
    doc_facet_index: dict | None = None,
    facet_basis: str = DEFAULT_FACET_BASIS,
    facet_match_threshold: float = DEFAULT_FACET_MATCH_THRESHOLD,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> pd.DataFrame:
    """Top ``top_k`` cross-source document candidates for one document.

    Pool: every candidate-source document above ``min_similarity``, closest
    first by whole-document embedding similarity (``similarity_metric="doc"``,
    the default) or by the single highest facet-to-facet cosine similarity
    between the two documents (``similarity_metric="facet"``, requires
    ``doc_facet_index`` -- see :func:`analysis.l2.facet_index.build_doc_facet_index`).
    Either way the resulting ``embedding_similarity`` column is whichever
    metric did the gating.

    ``facet_basis="embedding"`` also needs ``doc_facet_index``: instead of
    ``canonical_overlap`` on ``doc_profiles``, ``n_shared_canonical_facets``
    comes from :func:`analysis.l2.facet_index.facet_greedy_overlap` -- see
    :func:`analysis.l2.recommend_links.facet_basis_column`.

    Ranked by :func:`combined_score` (``is_document=True`` for every row
    here): a candidate that shares the source document's own L2 (or failing
    that, its L1, via ``source_affinity``) can outrank one with a slightly
    higher overlap or similarity, not just break an exact tie.
    """
    if similarity_metric == "facet" or facet_basis == "embedding":
        if doc_facet_index is None:
            raise ValueError(
                "similarity_metric='facet' or facet_basis='embedding' requires "
                "doc_facet_index"
            )
    if similarity_metric == "facet":
        sims = facet_max_similarities(doc_id, doc_ids, doc_facet_index)
    else:
        sims = doc_matrix @ doc_matrix[doc_index[doc_id]]
    sims = np.where(is_candidate, sims, -np.inf)
    ranked_idx = np.argsort(sims)[::-1][:pool_size]
    own_profile = doc_profiles.get(doc_id, {})

    rows = []
    for j in ranked_idx:
        if sims[j] < min_similarity:
            break  # sorted descending -- nothing further clears the bar either
        target_id = doc_ids[j]
        if facet_basis == "embedding":
            n_shared, pairs = facet_greedy_overlap(
                doc_id, target_id, doc_facet_index, threshold=facet_match_threshold
            )
            shared = [f"{a} ↔ {b} ({sim:.2f})" for a, b, sim in pairs]
        else:
            n_shared, shared = canonical_overlap(
                own_profile, doc_profiles.get(target_id, {})
            )
        row_meta = metadata.loc[target_id]
        candidate_l2 = doc_to_l2.get(target_id, "")
        rows.append(
            {
                "candidate_id": target_id,
                "candidate_label": row_meta["title"],
                "candidate_slug": row_meta["slug"],
                "candidate_source": row_meta["source"],
                "candidate_l2": candidate_l2,
                "candidate_l1": l2_to_l1.get(candidate_l2, ""),
                "source_affinity": source_affinity(
                    candidate_l2, own_l2, own_l1, l2_to_l1
                ),
                "embedding_similarity": float(sims[j]),
                "n_shared_canonical_facets": n_shared,
                "shared_canonical_facets": ", ".join(shared),
            }
        )
    pool_df = pd.DataFrame(rows)
    if pool_df.empty:
        return pool_df
    pool_df["_score"] = pool_df.apply(
        lambda r: combined_score(
            r["n_shared_canonical_facets"],
            True,
            r["source_affinity"],
            r["embedding_similarity"],
            weights=weights,
        ),
        axis=1,
    )
    return (
        pool_df.sort_values("_score", ascending=False)
        .drop(columns="_score")
        .head(top_k)
    )
