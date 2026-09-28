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
``l2-canonicalize-facets`` first): the number of **shared canonical
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

Output: one row per ``(source document, candidate)`` -- long/tidy, not the
wide ``complementary_l2_1/2`` shape -- as ``.xlsx``, same review-first
convention as the rest of the pipeline; sort by ``source_doc_id`` then
``combined_rank`` to see each page's best cross-links first, regardless of
type. A ``.md`` version is written alongside it -- one section per source
document (alphabetical by title), its links listed in ``combined_rank``
order -- for reading top to bottom rather than filtering a spreadsheet.
Every source document gets at least one row/section, including a document
that matched nothing in either pool (``confidence="no_candidates"``, every
candidate column blank) -- silently dropping it would look identical to it
never having been processed at all. ``source_l2``/``source_l1`` carry the
document's own current classification, so a reviewer doesn't need to cross-
reference ``docs.csv`` to see what's being linked *from*.

Run it::

    uv run l2-recommend-links \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/facets.csv \\
        analysis/output/l2/l2_l1.json

No credentials needed -- pure computation over already-computed embeddings
and canonical facets.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from tqdm import tqdm

from analysis.l2 import io
from analysis.l2.signatures import (
    build_l2_signatures,
    l2_normalize,
    score_against_signatures,
    stack_embeddings,
    top_recurring_facets,
)
from analysis.l2.use_cases import (
    build_doc_facet_index,
    facet_greedy_overlap,
    facet_max_similarities,
)

DEFAULT_SOURCE = "fiches_service_public"
DEFAULT_TARGET_SOURCES: tuple[str, ...] = (
    "modeles_de_courriers",
    "contributions",
    "outils",
)
DEFAULT_L2_POOL = 8
DEFAULT_L2_TOP_K = 2
DEFAULT_DOC_POOL = 12
DEFAULT_DOC_TOP_K = 4
DEFAULT_MIN_SIMILARITY = 0.75
# "doc": gate/rank document candidates by whole-document embedding cosine
# similarity (production default). "facet": gate/rank by the single highest
# facet-to-facet cosine similarity between the two documents instead -- a
# long, multi-topic source document's whole-document vector can be too
# diluted to clear the floor against a narrowly-focused candidate that
# closely matches on just one facet; this rescues that case.
DOCUMENT_SIMILARITY_METRICS: tuple[str, ...] = ("doc", "facet")
DEFAULT_SIMILARITY_METRIC = "doc"
# What counts as "the same facet" for n_shared_canonical_facets. "canonical"
# (default) groups by the clustered `canonical_facet` column from
# `l2-canonicalize-facets`: paraphrases ("préavis de démission" / "délai de
# préavis en cas de démission") count as shared, but that depends on the
# clustering's similarity threshold, which can occasionally over- or
# under-merge. "raw" groups by the literal per-document `text` instead: only
# exact wording counts as shared -- lower recall, but no clustering step
# (works even if `l2-canonicalize-facets` was never run) and no risk of two
# genuinely different concepts being merged by an over-eager threshold.
# "embedding" (DOCUMENT candidates only -- see rank_document_candidates)
# greedily matches facet embeddings pairwise per document pair instead of
# any text column at all: catches paraphrases like "canonical" does, but
# the fuzzy matching is scoped to one candidate pair rather than clustered
# once, corpus-wide, ahead of time.
FACET_BASES: tuple[str, ...] = ("canonical", "raw", "embedding")
DEFAULT_FACET_BASIS = "canonical"
DEFAULT_FACET_MATCH_THRESHOLD = 0.92


def facet_basis_column(facet_basis: str) -> str:
    """The facets-table column backing ``n_shared_canonical_facets`` for this basis.

    "embedding" has no text-column equivalent -- it matches DOCUMENT
    candidates' facets directly via embeddings (see
    :func:`analysis.l2.use_cases.facet_greedy_overlap`). L2-candidate
    overlap always needs a discrete per-document label though, so it falls
    back to ``canonical_facet`` in that case, same as "canonical".
    """
    return "text" if facet_basis == "raw" else "canonical_facet"


DEFAULT_L2_PROFILE_TOP_N = 20  # per facet type, so up to ~60 canonical facets/class

_OUTPUT_COLUMNS = [
    "source_doc_id",
    "source_title",
    "source_l2",
    "source_l1",
    "source_canonical_facets",
    "candidate_type",
    "combined_rank",
    "rank_within_type",
    "confidence",
    "candidate_id",
    "candidate_label",
    "candidate_source",
    "candidate_l2",
    "candidate_l1",
    "source_affinity",
    "n_shared_canonical_facets",
    "shared_canonical_facets",
    "embedding_similarity",
    "combined_score",
]

# confidence for a source document that matched no candidate at all (in
# either pool, after the min_similarity floor) -- distinct from "weak"
# (a candidate was found, just with zero shared canonical facets).
_NO_CANDIDATES = "no_candidates"


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
            "`uv run l2-canonicalize-facets facets.csv` first."
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


# Continuous 0-1 magnitude per source_affinity tier, for combined_score to
# blend -- unlike an ordinal rank, this is a size a linear score can weigh,
# not just an ordering. "same_l1" sits at half of "same_l2", a starting
# assumption, not a measured one.
SOURCE_AFFINITY_SCORE = {
    "same_l2": 1.0,
    "same_l1": 0.5,
    "other_l1": 0.0,
    "not_applicable": 0.0,
}

# Default weights for combined_score -- a starting point chosen to roughly
# preserve the old priority order (overlap first, then type, then affinity,
# then similarity) as a smooth tradeoff instead of a hard cliff; NOT fit on
# any data. Each is a coefficient on an already-explainable, already-
# exported column, so if real usage data (which links get kept, clicked,
# reverted) is ever collected per candidate, these are exactly the
# coefficients a logistic regression over this same feature set would
# re-estimate -- nothing about the features needs to change to do that,
# just these numbers.
DEFAULT_SCORE_WEIGHTS: dict[str, float] = {
    "n_shared_canonical_facets": 0.15,
    "is_document": 0.5,
    "source_affinity": 0.2,
    "embedding_similarity": 0.5,
}


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
    :func:`analysis.l2.use_cases.add_complementary_l2_columns_content_only`).
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
    ``doc_facet_index`` -- see :func:`analysis.l2.use_cases.build_doc_facet_index`).
    Either way the resulting ``embedding_similarity`` column is whichever
    metric did the gating.

    ``facet_basis="embedding"`` also needs ``doc_facet_index``: instead of
    ``canonical_overlap`` on ``doc_profiles``, ``n_shared_canonical_facets``
    comes from :func:`analysis.l2.use_cases.facet_greedy_overlap` -- see
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
                "candidate_source": row_meta["source"],
                "candidate_l2": candidate_l2,
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
            combined = pd.DataFrame([{"confidence": _NO_CANDIDATES}])
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
        combined.insert(2, "source_l2", own_l2)
        combined.insert(3, "source_l1", l2_to_l1.get(own_l2, ""))
        combined.insert(4, "source_canonical_facets", own_canonical_facets)
        tables.append(combined)

    if not tables:
        return pd.DataFrame(columns=_OUTPUT_COLUMNS)
    return pd.concat(tables, ignore_index=True).reindex(columns=_OUTPUT_COLUMNS)


# --------------------------------------------------------------------------- #
# Markdown rendering
# --------------------------------------------------------------------------- #


def render_markdown(table: pd.DataFrame, *, source: str) -> str:
    """Render :func:`build_links_table`'s output as Markdown, grouped by
    source document -- one section per document, its links listed by
    ``combined_rank``, for quick browsing. The ``.xlsx`` stays the tool for
    sorting/filtering; this is for reading top to bottom.
    """
    lines = [f"# Cross-links for `{source}`", ""]

    n_docs = table["source_doc_id"].nunique() if not table.empty else 0
    n_no_candidates = table.loc[
        table["confidence"] == _NO_CANDIDATES, "source_doc_id"
    ].nunique()
    pct = 100 * n_no_candidates / n_docs if n_docs else 0.0
    lines.append(
        f"{n_docs} documents processed, {n_no_candidates} ({pct:.1f}%) "
        "with no recommended link."
    )
    lines.append("")

    if table.empty:
        return "\n".join(lines)

    # One section per source document, alphabetically by title so a specific
    # page is easy to find in a long document.
    headers = table.drop_duplicates("source_doc_id")[
        [
            "source_doc_id",
            "source_title",
            "source_l2",
            "source_l1",
            "source_canonical_facets",
        ]
    ].sort_values("source_title")

    for _, header in headers.iterrows():
        doc_id = header["source_doc_id"]
        doc_rows = table[table["source_doc_id"] == doc_id]

        lines.append(f"## {header['source_title']}")
        lines.append(
            f"*id: `{doc_id}` -- L2: **{header['source_l2']}** "
            f"(L1: {header['source_l1']})*"
        )
        lines.append(
            f"*Canonical facets: {header['source_canonical_facets'] or 'none'}*"
        )
        lines.append("")

        if doc_rows.iloc[0]["confidence"] == _NO_CANDIDATES:
            lines.append("_No recommended link (below the similarity floor)._")
            lines.append("")
            continue

        for _, r in doc_rows.sort_values("combined_rank").iterrows():
            if r["candidate_type"] == "l2":
                target = f"**L2** *{r['candidate_label']}* (L1: {r['candidate_l1']})"
            else:
                target = (
                    f"**{r['candidate_source']}**: {r['candidate_label']} "
                    f"({r['source_affinity']})"
                )
            shared = r["shared_canonical_facets"] or "none"
            lines.append(
                f"{int(r['combined_rank'])}. [{r['confidence']}] {target} "
                f"-- shared: {shared} (similarity {r['embedding_similarity']:.2f})"
            )
        lines.append("")

    return "\n".join(lines)


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
        help="what counts as \"the same facet\" for n_shared_canonical_facets: "
        "the clustered canonical_facet column from l2-canonicalize-facets "
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
        default=Path(__file__).resolve().parents[3] / "output" / "l2",
        help="output directory for the review .xlsx file",
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
    out_path = args.out / f"{args.source}_links.xlsx"
    table.to_excel(out_path, index=False)

    md_path = args.out / f"{args.source}_links.md"
    md_path.write_text(render_markdown(table, source=args.source), encoding="utf-8")

    n_docs = table["source_doc_id"].nunique() if not table.empty else 0
    print(f"\n✓ {len(table)} candidate links across {n_docs} {args.source} documents")
    print(f"✓ {out_path}")
    print(f"✓ {md_path}")

    if n_docs:
        n_no_candidates = table.loc[
            table["confidence"] == _NO_CANDIDATES, "source_doc_id"
        ].nunique()
        pct_no_candidates = 100 * n_no_candidates / n_docs
        print(
            f"⚠ {n_no_candidates}/{n_docs} documents ({pct_no_candidates:.1f}%) "
            "have no recommended link at all"
        )


if __name__ == "__main__":
    main()
