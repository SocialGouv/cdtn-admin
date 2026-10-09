"""Pure scoring primitives for link recommendation: canonical-facet profiles,
overlap, confidence tiers, source affinity and the blended combined score.
"""

from __future__ import annotations

import pandas as pd

from analysis.l2.config import (
    DEFAULT_L2_PROFILE_TOP_N,
    DEFAULT_SCORE_WEIGHTS,
    SOURCE_AFFINITY_SCORE,
)
from analysis.l2.signatures.core import top_recurring_facets


def facet_basis_column(facet_basis: str) -> str:
    """The facets-table column backing ``n_shared_canonical_facets`` for this basis.

    "embedding" has no text-column equivalent -- it matches DOCUMENT
    candidates' facets directly via embeddings (see
    :func:`analysis.l2.facet_index.facet_greedy_overlap`). L2-candidate
    overlap always needs a discrete per-document label though, so it falls
    back to ``canonical_facet`` in that case, same as "canonical".
    """
    return "text" if facet_basis == "raw" else "canonical_facet"


# --------------------------------------------------------------------------- #
# Canonical facet profiles
# --------------------------------------------------------------------------- #


def build_doc_canonical_profiles(
    facets_df: pd.DataFrame,
    *,
    doc_id_col: str = "doc_id",
    canonical_col: str = "canonical_facet",
    salience_col: str = "salience",
) -> dict[str, dict[str, int]]:
    """``doc_id -> {canonical_facet: max salience}``, for every document."""
    if canonical_col not in facets_df.columns:
        raise ValueError(
            f"facets_df has no '{canonical_col}' column -- run "
            "`uv run l2 facets canonicalize facets.csv` first."
        )
    profiles: dict[str, dict[str, int]] = {}
    for doc_id, group in facets_df.groupby(doc_id_col):
        profiles[doc_id] = group.groupby(canonical_col)[salience_col].max().to_dict()
    return profiles


def build_l2_canonical_profiles(
    facets_df: pd.DataFrame,
    doc_to_l2: dict[str, str],
    *,
    top_n: int = DEFAULT_L2_PROFILE_TOP_N,
    canonical_col: str = "canonical_facet",
) -> dict[str, set[str]]:
    """``l2 -> its most recurring canonical facets`` (frequency x avg salience).

    Reuses :func:`analysis.l2.signatures.top_recurring_facets` unchanged --
    it already accepts a custom ``text_col``, so pointing it at
    ``canonical_facet`` needs no new aggregation logic.
    """
    l2_to_doc_ids: dict[str, list] = {}
    for doc_id, l2 in doc_to_l2.items():
        l2_to_doc_ids.setdefault(l2, []).append(doc_id)

    profiles: dict[str, set[str]] = {}
    for l2, doc_ids in l2_to_doc_ids.items():
        top = top_recurring_facets(
            facets_df, doc_ids, top_n=top_n, text_col=canonical_col
        )
        profiles[l2] = set(top[canonical_col]) if not top.empty else set()
    return profiles


def canonical_overlap(
    profile_a: dict[str, int] | set[str], profile_b: dict[str, int] | set[str]
) -> tuple[int, list[str]]:
    """Shared canonical facets between two profiles: ``(count, sorted labels)``."""
    shared = sorted(set(profile_a) & set(profile_b))
    return len(shared), shared


def confidence_tier(n_shared_canonical_facets: int) -> str:
    """A transparent tier from the one number that matters most -- not a hidden score.

    Every candidate that reaches this function already cleared the
    embedding-similarity floor (``min_similarity``), so the tier reduces to
    the overlap count alone.
    """
    if n_shared_canonical_facets >= 2:
        return "strong"
    if n_shared_canonical_facets == 1:
        return "moderate"
    return "weak"


# How closely a DOCUMENT candidate's own L2 relates to the source document's
# own L2/L1 -- one input to combined_score (see below). "not_applicable" is
# the fixed value given to L2 candidates (deliberately not "n/a" -- pandas/
# Excel treat that string itself as a missing value on re-read, silently
# blanking the column): an L2 candidate can never be "same_l2" (already
# excluded upstream in rank_complementary_l2_candidates as misclassification
# territory, not complementarity) and its own L1-relatedness is already
# baked into how it was ranked, so this tier simply doesn't apply to it.
def source_affinity(
    candidate_l2: str, own_l2: str, own_l1: str, l2_to_l1: dict[str, str]
) -> str:
    """How closely a document candidate's own L2 relates to the source's L2/L1.

    ``"same_l2"`` (the strongest possible topical link -- both documents
    filed under the exact same sub-theme), ``"same_l1"`` (different L2, same
    L1 parent theme), or ``"other_l1"``.
    """
    if candidate_l2 == own_l2:
        return "same_l2"
    if l2_to_l1.get(candidate_l2) == own_l1:
        return "same_l1"
    return "other_l1"


def combined_score(
    n_shared_canonical_facets: int,
    is_document: bool,
    source_affinity_tier: str,
    embedding_similarity: float,
    *,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> float:
    """Blended ranking score: a plain weighted sum over four explainable,
    already-exported columns. ``n_shared_canonical_facets`` is uncapped --
    each additional shared facet is worth the same regardless of how many
    there already are. Unlike the ordinal tiebreak this replaces, a small
    gap in one factor can now be outweighed by a large enough gap in
    another -- e.g. a document one facet behind an L2 can still win if it's
    ``same_l2`` and the L2 isn't much more similar.
    """
    return (
        weights["n_shared_canonical_facets"] * n_shared_canonical_facets
        + weights["is_document"] * float(is_document)
        + weights["source_affinity"] * SOURCE_AFFINITY_SCORE[source_affinity_tier]
        + weights["embedding_similarity"] * embedding_similarity
    )


# confidence for a source document that matched no candidate at all (in
# either pool, after the min_similarity floor) -- distinct from "weak"
# (a candidate was found, just with zero shared canonical facets).
NO_CANDIDATES = "no_candidates"
