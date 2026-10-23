"""L2 pipeline, diagnostic tool: explain the scoring process for one document.

Reproduces :mod:`analysis.l2.links.recommend`'s exact ranking logic for a
single source document, but with a **widened window** per pool (more
candidates than the default ``--l2-top-k``/``--doc-top-k`` actually export)
and an explicit reason for every candidate that *didn't* make the pool --
own L2, more similar than the doc's own L2 (misclassification territory,
not complementarity), below ``--min-similarity``, wrong source, or simply
outside the widened window. This is deliberately not the full corpus-wide
candidate universe (there could be ~100 L2s and hundreds of documents) --
just enough more than the production pool size to judge whether
``--l2-pool``/``--doc-pool``/``--min-similarity`` are cutting off something
that should have made the cut.

The final section reproduces exactly what
:func:`analysis.l2.recommend_links.build_links_table` would select for this
one document, so you can confirm the widened view and the real export agree.

Pass one or more ``--candidate`` (an L2 name or a document id) to get that
*specific* candidate's exact status -- similarity, exclusion reason, rank,
shared facets, selected or not -- even if it never shows up in the widened
pool tables above (below the floor, wrong source, or simply outside the
pool window).

For DOCUMENT candidates, both the whole-document embedding cosine
similarity and the single highest facet-to-facet cosine similarity are
always shown side by side, everywhere a document candidate is reported --
the widened-pool table, a specific ``--candidate``, and the final combined
selection. ``--similarity-metric {doc,facet}`` picks which one actually
gates/ranks the pool (default: ``doc``, matching production); the other is
still visible, so you can see exactly which candidates the facet metric
would rescue that the whole-document floor currently excludes -- useful
when a long, multi-topic source document's own embedding is too diluted to
sit close to a narrowly-focused candidate.

``--facet-basis {canonical,raw,embedding}`` picks what
``n_shared_canonical_facets`` (and the "shared facets" it lists) actually
counts as the same concept: ``canonical`` (default) is the clustered
``canonical_facet`` column from ``l2 facets canonicalize``, crediting
paraphrases; ``raw`` is the literal per-document ``text``, exact wording
only -- no clustering step, and no risk of that clustering's similarity
threshold merging two genuinely different concepts; ``embedding``
(DOCUMENT candidates only) greedily matches the two documents' own facet
embeddings pairwise (``--facet-match-threshold``, default 0.92) -- credits
paraphrases like ``canonical`` does, but the fuzzy matching is scoped to
one candidate pair instead of a corpus-wide clustering pass. See
:func:`analysis.l2.recommend_links.facet_basis_column`.

Run it::

    uv run l2 links explain \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/facets.csv \\
        analysis/output/l2/l2_l1.json \\
        <doc_id> \\
        --candidate <l2_name_or_doc_id>

No credentials needed.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

from analysis.l2 import io
from analysis.l2.config import (
    DEFAULT_DOC_TOP_K,
    DEFAULT_FACET_BASIS,
    DEFAULT_FACET_MATCH_THRESHOLD,
    DEFAULT_FACET_SCORE_THRESHOLD,
    DEFAULT_L2_TOP_K,
    DEFAULT_MIN_SIMILARITY,
    DEFAULT_SCORE_WEIGHTS,
    DEFAULT_SIMILARITY_METRIC,
    DEFAULT_SOURCE,
    DEFAULT_TARGET_SOURCES,
    DOCUMENT_SIMILARITY_METRICS,
    EXPLAIN_DOC_POOL,
    EXPLAIN_L2_POOL,
    FACET_BASES,
)
from analysis.l2.facet_index import (
    build_doc_facet_index,
    facet_greedy_overlap,
    facet_max_similarities,
    facet_pairs_above_threshold,
)
from analysis.l2.links.scoring import (
    build_doc_canonical_profiles,
    build_l2_canonical_profiles,
    canonical_overlap,
    combined_score,
    confidence_tier,
    facet_basis_column,
    source_affinity,
)
from analysis.l2.signatures.core import (
    build_l2_signatures,
    l2_normalize,
    score_against_signatures,
    stack_embeddings,
)


def l2_exclusion_reason(
    l2: str,
    similarity: float,
    *,
    own_l2: str,
    own_similarity: float,
    min_similarity: float,
) -> str | None:
    """Why one L2 wouldn't enter the complementary-L2 pool, or ``None`` if it would."""
    if l2 == own_l2:
        return "own_l2"
    if similarity > own_similarity:
        return "more_similar_than_own"
    if similarity < min_similarity:
        return "below_min_similarity"
    return None


def explain_l2_candidates(
    doc_embedding: np.ndarray,
    own_l2: str,
    signatures: dict,
    doc_profile: dict[str, int],
    l2_profiles: dict[str, set[str]],
    l2_to_l1: dict[str, str],
    *,
    pool_size: int = EXPLAIN_L2_POOL,
    top_k: int = DEFAULT_L2_TOP_K,
    min_similarity: float = DEFAULT_MIN_SIMILARITY,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> tuple[pd.DataFrame, dict[str, int]]:
    """Every L2 with a similarity score, labeled with why it's excluded (if
    it is), plus the widened surviving pool ranked and flagged ``selected``.

    Ranked by :func:`analysis.l2.recommend_links.combined_score`
    (``is_document=False``, ``source_affinity="not_applicable"`` for every
    row, matching :func:`analysis.l2.recommend_links.rank_complementary_l2_candidates`).
    """
    ranked = score_against_signatures(doc_embedding, signatures)
    own_row = ranked.loc[ranked["l2"] == own_l2, "similarity"]
    own_similarity = float(own_row.iloc[0]) if len(own_row) else float("inf")

    ranked = ranked.copy()
    ranked["exclusion_reason"] = ranked.apply(
        lambda row: l2_exclusion_reason(
            row["l2"],
            row["similarity"],
            own_l2=own_l2,
            own_similarity=own_similarity,
            min_similarity=min_similarity,
        ),
        axis=1,
    )
    excluded = dict(ranked["exclusion_reason"].value_counts(dropna=True))

    qualifying = ranked[ranked["exclusion_reason"].isna()]
    excluded["beyond_widened_pool"] = max(0, len(qualifying) - pool_size)
    pool = qualifying.head(pool_size)

    rows = []
    for _, r in pool.iterrows():
        n_shared, shared = canonical_overlap(
            doc_profile, l2_profiles.get(r["l2"], set())
        )
        rows.append(
            {
                "l2": r["l2"],
                "l1": l2_to_l1.get(r["l2"], ""),
                "embedding_similarity": float(r["similarity"]),
                "n_shared_canonical_facets": n_shared,
                "shared_canonical_facets": ", ".join(shared),
                "confidence": confidence_tier(n_shared),
            }
        )
    table = pd.DataFrame(rows)
    if not table.empty:
        table["_score"] = table.apply(
            lambda r: combined_score(
                r["n_shared_canonical_facets"],
                False,
                "not_applicable",
                r["embedding_similarity"],
                weights=weights,
            ),
            axis=1,
        )
        table = (
            table.sort_values("_score", ascending=False)
            .drop(columns="_score")
            .reset_index(drop=True)
        )
        table["rank"] = table.index + 1
        table["selected"] = table["rank"] <= top_k
    return table, excluded


def explain_document_candidates(
    doc_id: str,
    doc_matrix: np.ndarray,
    doc_ids: list[str],
    doc_index: dict[str, int],
    is_candidate: np.ndarray,
    metadata: pd.DataFrame,
    doc_profiles: dict[str, dict[str, int]],
    doc_facet_index: dict,
    doc_to_l2: dict[str, str],
    own_l2: str,
    own_l1: str,
    l2_to_l1: dict[str, str],
    *,
    pool_size: int = EXPLAIN_DOC_POOL,
    top_k: int = DEFAULT_DOC_TOP_K,
    min_similarity: float = DEFAULT_MIN_SIMILARITY,
    similarity_metric: str = DEFAULT_SIMILARITY_METRIC,
    facet_basis: str = DEFAULT_FACET_BASIS,
    facet_match_threshold: float = DEFAULT_FACET_MATCH_THRESHOLD,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> tuple[pd.DataFrame, dict[str, int]]:
    """Every candidate-source document ranked by similarity, the widened
    surviving pool with overlap details, and why anything else was excluded.

    Both ``embedding_similarity`` (whole-document cosine) and
    ``facet_max_similarity`` (highest single facet-to-facet cosine) are
    always reported, regardless of ``similarity_metric`` -- that's what lets
    you compare which candidates the facet floor would rescue against the
    production whole-document floor. ``similarity_metric`` only controls
    which of the two actually gates/orders the pool here (same as
    :func:`analysis.l2.recommend_links.rank_document_candidates`).
    ``facet_basis`` picks how ``n_shared_canonical_facets`` is computed --
    see :func:`analysis.l2.recommend_links.facet_basis_column`. The pool is
    ranked by :func:`analysis.l2.recommend_links.combined_score` (same
    ``weights`` as production), so ``source_affinity`` (see
    :func:`analysis.l2.recommend_links.source_affinity`) can outweigh a
    small overlap/similarity gap, not just break an exact tie.
    """
    doc_sims = doc_matrix @ doc_matrix[doc_index[doc_id]]
    facet_sims = facet_max_similarities(doc_id, doc_ids, doc_facet_index)
    gating_sims = doc_sims if similarity_metric == "doc" else facet_sims

    order = np.argsort(gating_sims)[::-1]
    own_profile = doc_profiles.get(doc_id, {})

    excluded = {"wrong_source": 0, "below_min_similarity": 0, "beyond_widened_pool": 0}
    rows = []
    for j in order:
        target_id = doc_ids[j]
        if target_id == doc_id:
            continue
        if not is_candidate[j]:
            excluded["wrong_source"] += 1
            continue
        if gating_sims[j] < min_similarity:
            excluded["below_min_similarity"] += 1
            continue
        if len(rows) >= pool_size:
            excluded["beyond_widened_pool"] += 1
            continue
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
                "doc_id": target_id,
                "title": row_meta["title"],
                "source": row_meta["source"],
                "candidate_l2": candidate_l2,
                "source_affinity": source_affinity(
                    candidate_l2, own_l2, own_l1, l2_to_l1
                ),
                "embedding_similarity": float(doc_sims[j]),
                "facet_max_similarity": float(facet_sims[j]),
                "n_shared_canonical_facets": n_shared,
                "shared_canonical_facets": ", ".join(shared),
                "confidence": confidence_tier(n_shared),
            }
        )
    table = pd.DataFrame(rows)
    if not table.empty:
        gating_col = (
            "embedding_similarity"
            if similarity_metric == "doc"
            else "facet_max_similarity"
        )
        table["_score"] = table.apply(
            lambda r: combined_score(
                r["n_shared_canonical_facets"],
                True,
                r["source_affinity"],
                r[gating_col],
                weights=weights,
            ),
            axis=1,
        )
        table = (
            table.sort_values("_score", ascending=False)
            .drop(columns="_score")
            .reset_index(drop=True)
        )
        table["rank"] = table.index + 1
        table["selected"] = table["rank"] <= top_k
    return table, excluded


# --------------------------------------------------------------------------- #
# One specific candidate, by id -- unlike the widened-pool tables above, this
# always finds the candidate's exact status even if it's below the
# min-similarity floor, from the wrong source, or ranked well outside the
# widened pool window. That's the whole point: those tables only ever show
# what *did* survive, so a candidate you already have in mind (a doc_id from
# a spreadsheet, an L2 name someone suggested) can be entirely absent from
# them with no way to tell why.
# --------------------------------------------------------------------------- #


def locate_candidate(
    candidate_id: str, l2_to_l1: dict[str, str], doc_index: dict[str, int]
) -> str:
    """Whether ``candidate_id`` names an L2 class or a document.

    Returns ``"l2"`` or ``"document"``.
    """
    is_l2 = candidate_id in l2_to_l1
    is_doc = candidate_id in doc_index
    if is_l2 and is_doc:
        raise SystemExit(
            f"candidate {candidate_id!r} is ambiguous -- it matches both an L2 "
            "name and a document id"
        )
    if is_l2:
        return "l2"
    if is_doc:
        return "document"
    raise SystemExit(
        f"candidate {candidate_id!r} is neither a known L2 nor a document id "
        "among --source/--target-source"
    )


def explain_l2_candidate(
    candidate_l2: str,
    doc_embedding: np.ndarray,
    own_l2: str,
    signatures: dict,
    doc_profile: dict[str, int],
    l2_profiles: dict[str, set[str]],
    l2_to_l1: dict[str, str],
    *,
    pool_size: int,
    top_k: int,
    min_similarity: float,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> dict:
    """Exact status of one L2 as a complementary-L2 candidate for this document."""
    ranked = score_against_signatures(doc_embedding, signatures)
    own_row = ranked.loc[ranked["l2"] == own_l2, "similarity"]
    own_similarity = float(own_row.iloc[0]) if len(own_row) else float("inf")

    row = ranked.loc[ranked["l2"] == candidate_l2]
    if row.empty:
        raise SystemExit(f"L2 {candidate_l2!r} has no signature")
    similarity = float(row.iloc[0]["similarity"])

    reason = l2_exclusion_reason(
        candidate_l2,
        similarity,
        own_l2=own_l2,
        own_similarity=own_similarity,
        min_similarity=min_similarity,
    )

    qualifying = ranked[
        ranked.apply(
            lambda r: (
                l2_exclusion_reason(
                    r["l2"],
                    r["similarity"],
                    own_l2=own_l2,
                    own_similarity=own_similarity,
                    min_similarity=min_similarity,
                )
                is None
            ),
            axis=1,
        )
    ]
    similarity_rank = None
    in_widened_pool = False
    if reason is None:
        similarity_rank = int((qualifying["similarity"] > similarity).sum()) + 1
        in_widened_pool = similarity_rank <= pool_size

    n_shared, shared = canonical_overlap(
        doc_profile, l2_profiles.get(candidate_l2, set())
    )

    facet_rank = None
    selected = False
    if in_widened_pool:
        pool = qualifying.head(pool_size).copy()
        pool["n_shared_canonical_facets"] = pool["l2"].apply(
            lambda l2: canonical_overlap(doc_profile, l2_profiles.get(l2, set()))[0]
        )
        pool["_score"] = pool.apply(
            lambda r: combined_score(
                r["n_shared_canonical_facets"],
                False,
                "not_applicable",
                r["similarity"],
                weights=weights,
            ),
            axis=1,
        )
        pool = pool.sort_values("_score", ascending=False).reset_index(drop=True)
        facet_rank = int(pool.index[pool["l2"] == candidate_l2][0]) + 1
        selected = facet_rank <= top_k

    return {
        "candidate_type": "l2",
        "candidate_id": candidate_l2,
        "candidate_label": f"{candidate_l2} (L1: {l2_to_l1.get(candidate_l2, '')})",
        "candidate_l2": candidate_l2,
        "candidate_l1": l2_to_l1.get(candidate_l2, ""),
        "source_affinity": "not_applicable",
        "candidate_own_facets": sorted(l2_profiles.get(candidate_l2, set())),
        "similarity_metric": "doc",
        "embedding_similarity": similarity,
        "facet_max_similarity": None,
        "facet_comparisons": None,
        "combined_score": combined_score(
            n_shared, False, "not_applicable", similarity, weights=weights
        ),
        "exclusion_reason": reason,
        "similarity_rank_among_qualifying": similarity_rank,
        "pool_size": pool_size,
        "in_widened_pool": in_widened_pool,
        "n_shared_canonical_facets": n_shared,
        "shared_canonical_facets": shared,
        "confidence": confidence_tier(n_shared),
        "facet_rank_within_pool": facet_rank,
        "top_k": top_k,
        "selected": selected,
    }


def explain_document_candidate(
    candidate_doc_id: str,
    doc_id: str,
    doc_matrix: np.ndarray,
    doc_ids: list[str],
    doc_index: dict[str, int],
    is_candidate: np.ndarray,
    metadata: pd.DataFrame,
    doc_profiles: dict[str, dict[str, int]],
    doc_to_l2: dict[str, str],
    l2_to_l1: dict[str, str],
    doc_facet_index: dict,
    *,
    pool_size: int,
    top_k: int,
    min_similarity: float,
    similarity_metric: str = DEFAULT_SIMILARITY_METRIC,
    facet_basis: str = DEFAULT_FACET_BASIS,
    facet_match_threshold: float = DEFAULT_FACET_MATCH_THRESHOLD,
    facet_score_threshold: float = DEFAULT_FACET_SCORE_THRESHOLD,
    weights: dict[str, float] = DEFAULT_SCORE_WEIGHTS,
) -> dict:
    """Exact status of one document as a cross-source candidate for this document.

    Both ``embedding_similarity`` and ``facet_max_similarity`` are always
    computed and returned; ``similarity_metric`` only controls which one
    gates/ranks (see :func:`explain_document_candidates`). ``facet_basis``
    picks how ``n_shared_canonical_facets`` is computed -- see
    :func:`analysis.l2.recommend_links.facet_basis_column`. ``facet_comparisons``
    is the full facet-to-facet score breakdown at >= ``facet_score_threshold``
    (independent of ``facet_basis`` -- always computed, for inspecting
    exactly what was compared to what; see
    :func:`analysis.l2.facet_index.facet_pairs_above_threshold`). The pool is
    ranked by :func:`analysis.l2.recommend_links.combined_score` (same
    ``weights`` as production).
    """
    doc_sims = doc_matrix @ doc_matrix[doc_index[doc_id]]
    facet_sims = facet_max_similarities(doc_id, doc_ids, doc_facet_index)
    gating_sims = doc_sims if similarity_metric == "doc" else facet_sims
    own_profile = doc_profiles.get(doc_id, {})
    own_l2 = doc_to_l2.get(doc_id, "")
    own_l1 = l2_to_l1.get(own_l2, "")

    def overlap(target_id: str) -> tuple[int, list]:
        if facet_basis == "embedding":
            n, pairs = facet_greedy_overlap(
                doc_id, target_id, doc_facet_index, threshold=facet_match_threshold
            )
            return n, [f"{a} ↔ {b} ({sim:.2f})" for a, b, sim in pairs]
        return canonical_overlap(own_profile, doc_profiles.get(target_id, {}))

    def score_for(target_id: str) -> float:
        candidate_l2 = doc_to_l2.get(target_id, "")
        tier = source_affinity(candidate_l2, own_l2, own_l1, l2_to_l1)
        n_shared = overlap(target_id)[0]
        sim = float(gating_sims[doc_index[target_id]])
        return combined_score(n_shared, True, tier, sim, weights=weights)

    j = doc_index[candidate_doc_id]
    gating_similarity = float(gating_sims[j])

    if candidate_doc_id == doc_id:
        reason = "is_source_document"
    elif not is_candidate[j]:
        reason = "wrong_source"
    elif gating_similarity < min_similarity:
        reason = "below_min_similarity"
    else:
        reason = None

    qualifying_mask = is_candidate & (gating_sims >= min_similarity)
    qualifying_mask[doc_index[doc_id]] = False
    similarity_rank = None
    in_widened_pool = False
    if reason is None:
        similarity_rank = (
            int((gating_sims[qualifying_mask] > gating_similarity).sum()) + 1
        )
        in_widened_pool = similarity_rank <= pool_size

    n_shared, shared = overlap(candidate_doc_id)

    facet_rank = None
    selected = False
    if in_widened_pool:
        order = np.argsort(gating_sims)[::-1]
        pool_ids = [doc_ids[idx] for idx in order if qualifying_mask[idx]][:pool_size]
        pool_rows = sorted(
            ((pid, score_for(pid)) for pid in pool_ids),
            key=lambda r: r[1],
            reverse=True,
        )
        facet_rank = next(
            rank
            for rank, r in enumerate(pool_rows, start=1)
            if r[0] == candidate_doc_id
        )
        selected = facet_rank <= top_k

    row_meta = metadata.loc[candidate_doc_id]
    candidate_l2 = doc_to_l2.get(candidate_doc_id, "")
    own_facets = sorted(
        doc_profiles.get(candidate_doc_id, {}).items(),
        key=lambda kv: kv[1],
        reverse=True,
    )
    facet_comparisons = facet_pairs_above_threshold(
        doc_id, candidate_doc_id, doc_facet_index, threshold=facet_score_threshold
    )
    return {
        "candidate_type": "document",
        "candidate_id": candidate_doc_id,
        "candidate_label": f"{row_meta['title']} ({row_meta['source']})",
        "candidate_l2": candidate_l2,
        "candidate_l1": l2_to_l1.get(candidate_l2, ""),
        "source_affinity": source_affinity(candidate_l2, own_l2, own_l1, l2_to_l1),
        "candidate_own_facets": own_facets,
        "similarity_metric": similarity_metric,
        "embedding_similarity": float(doc_sims[j]),
        "facet_max_similarity": float(facet_sims[j]),
        "facet_comparisons": facet_comparisons,
        "facet_score_threshold": facet_score_threshold,
        "combined_score": score_for(candidate_doc_id),
        "exclusion_reason": reason,
        "similarity_rank_among_qualifying": similarity_rank,
        "pool_size": pool_size,
        "in_widened_pool": in_widened_pool,
        "n_shared_canonical_facets": n_shared,
        "shared_canonical_facets": shared,
        "confidence": confidence_tier(n_shared),
        "facet_rank_within_pool": facet_rank,
        "top_k": top_k,
        "selected": selected,
    }


def print_candidate_explanation(result: dict) -> None:
    print(
        f"\n=== Candidate: {result['candidate_label']} ({result['candidate_id']}) ==="
    )
    print(f"type: {result['candidate_type']}")
    if result["candidate_type"] == "document":
        print(f"candidate L2: {result['candidate_l2']}  (L1: {result['candidate_l1']})")
        print(f"source affinity: {result['source_affinity']}")
        own_facets = [
            f"{facet} (salience {salience})"
            for facet, salience in result["candidate_own_facets"]
        ]
    else:
        print(f"candidate L1: {result['candidate_l1']}")
        own_facets = list(result["candidate_own_facets"])
    print(f"candidate's own facets ({len(own_facets)}, facet basis noted above):")
    for facet in own_facets:
        print(f"  - {facet}")
    if not own_facets:
        print("  (none)")

    gate = result["similarity_metric"]
    gate_mark = " <- gates the floor/pool" if gate == "doc" else ""
    print(
        f"embedding similarity (whole-document): "
        f"{result['embedding_similarity']:.4f}{gate_mark}"
    )
    if result["facet_max_similarity"] is not None:
        gate_mark = " <- gates the floor/pool" if gate == "facet" else ""
        print(f"facet max similarity: {result['facet_max_similarity']:.4f}{gate_mark}")

    shared = ", ".join(result["shared_canonical_facets"]) or "none"
    print(f"shared facets ({result['n_shared_canonical_facets']}): {shared}")
    print(f"confidence: {result['confidence']}")
    print(f"combined score: {result['combined_score']:.4f}")

    if result["facet_comparisons"] is not None:
        threshold = result["facet_score_threshold"]
        comparisons = result["facet_comparisons"]
        print(f"\nfacet comparisons (score >= {threshold:.2f}, {len(comparisons)}):")
        if comparisons:
            for a, b, sim in comparisons:
                print(f"  {sim:.4f}  {a}  ↔  {b}")
        else:
            print("  (none)")

    if result["exclusion_reason"] is not None:
        print(f"EXCLUDED at the similarity stage: {result['exclusion_reason']}")
        return

    print(
        f"similarity rank among qualifying candidates: "
        f"{result['similarity_rank_among_qualifying']}"
    )
    if not result["in_widened_pool"]:
        print(
            f"EXCLUDED: beyond the widened pool window "
            f"(pool_size={result['pool_size']}) -- rerun with a larger "
            "--l2-pool/--doc-pool to bring it in"
        )
        return

    print(
        f"rank within widened pool (by shared facets, then similarity): "
        f"{result['facet_rank_within_pool']}"
    )
    verdict = "SELECTED" if result["selected"] else "NOT SELECTED"
    print(f"{verdict}: top_k={result['top_k']}")


def _print_table(df: pd.DataFrame, columns: list[str]) -> None:
    if df.empty:
        print("  (none)")
        return
    with pd.option_context(
        "display.max_rows", None, "display.width", None, "display.max_colwidth", 60
    ):
        print(df[columns].to_string(index=False))


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument(
        "facets", type=Path, help="path to facets.csv (must have canonical_facet)"
    )
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument("doc_id", help="id of the document to explain (from docs.csv)")
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    parser.add_argument(
        "--target-source", action="append", dest="target_sources", default=None
    )
    parser.add_argument("--l2-top-k", type=int, default=DEFAULT_L2_TOP_K)
    parser.add_argument("--l2-pool", type=int, default=EXPLAIN_L2_POOL)
    parser.add_argument("--doc-top-k", type=int, default=DEFAULT_DOC_TOP_K)
    parser.add_argument("--doc-pool", type=int, default=EXPLAIN_DOC_POOL)
    parser.add_argument("--min-similarity", type=float, default=DEFAULT_MIN_SIMILARITY)
    parser.add_argument(
        "--similarity-metric",
        choices=DOCUMENT_SIMILARITY_METRICS,
        default=DEFAULT_SIMILARITY_METRIC,
        help="how DOCUMENT candidates (not L2 candidates) are gated/ranked: "
        "whole-document embedding cosine similarity (default) or the "
        "single highest facet-to-facet cosine similarity between the two "
        "documents. Both are always shown; this picks which one gates the "
        f"floor/pool (default: {DEFAULT_SIMILARITY_METRIC})",
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
        "documents' own facets (DOCUMENT candidates only) "
        f"(default: {DEFAULT_FACET_BASIS})",
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
        "--facet-score-threshold",
        type=float,
        default=DEFAULT_FACET_SCORE_THRESHOLD,
        help="for a --candidate document, print every facet-to-facet score "
        ">= this (independent of --facet-basis/--facet-match-threshold -- "
        "purely diagnostic, not deduped, so a facet can appear in several "
        f"pairs) (default: {DEFAULT_FACET_SCORE_THRESHOLD})",
    )
    parser.add_argument(
        "--candidate",
        action="append",
        dest="candidates",
        default=None,
        help="explain one specific candidate by id (an L2 name or a document "
        "id) regardless of pool size, floor, or exclusion -- repeatable",
    )
    args = parser.parse_args(argv)
    args.target_sources = (
        tuple(args.target_sources) if args.target_sources else DEFAULT_TARGET_SOURCES
    )
    return args


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    weights = {
        "n_shared_canonical_facets": args.weight_overlap,
        "is_document": args.weight_is_document,
        "source_affinity": args.weight_source_affinity,
        "embedding_similarity": args.weight_similarity,
    }

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)

    doc_rows = docs_df.loc[docs_df["id"] == args.doc_id]
    if doc_rows.empty:
        raise SystemExit(f"no document with id={args.doc_id!r} in {args.docs}")
    doc_row = doc_rows.iloc[0]
    own_l2 = doc_row["l2"]
    own_l1 = l2_to_l1.get(own_l2, "")
    doc_embedding = np.asarray(doc_row["embedding"], dtype=float)

    print(f"=== {doc_row['title']} ({args.doc_id}) ===")
    print(f"source: {doc_row['source']}")
    print(f"current L2: {own_l2}  (L1: {l2_to_l1.get(own_l2, '?')})")

    canonical_col = facet_basis_column(args.facet_basis)
    doc_profiles = build_doc_canonical_profiles(facets_df, canonical_col=canonical_col)
    doc_profile = doc_profiles.get(args.doc_id, {})
    print(f"\n{args.facet_basis} facets (own, sorted by salience):")
    if doc_profile:
        for facet, salience in sorted(
            doc_profile.items(), key=lambda kv: kv[1], reverse=True
        ):
            print(f"  - {facet} (salience {salience})")
    else:
        print("  (none)")

    print("\n⏳ Building L2 signatures…", flush=True)
    signatures = build_l2_signatures(docs_df, facets_df, l2_to_l1)
    doc_to_l2 = docs_df.set_index("id")["l2"].to_dict()
    l2_profiles = build_l2_canonical_profiles(
        facets_df, doc_to_l2, canonical_col=canonical_col
    )
    doc_facet_index = build_doc_facet_index(facets_df)

    print(
        f"\n--- Complementary L2 candidates (widened pool: top {args.l2_pool}, "
        f"facet basis: {args.facet_basis}) ---"
    )
    l2_table, l2_excluded = explain_l2_candidates(
        doc_embedding,
        own_l2,
        signatures,
        doc_profile,
        l2_profiles,
        l2_to_l1,
        pool_size=args.l2_pool,
        top_k=args.l2_top_k,
        min_similarity=args.min_similarity,
        weights=weights,
    )
    _print_table(
        l2_table,
        [
            "rank",
            "l2",
            "l1",
            "embedding_similarity",
            "n_shared_canonical_facets",
            "shared_canonical_facets",
            "confidence",
            "selected",
        ],
    )
    print(f"excluded elsewhere: {l2_excluded}")

    relevant = docs_df[docs_df["source"].isin((args.source, *args.target_sources))]
    doc_ids = relevant["id"].tolist()
    doc_index = {d: i for i, d in enumerate(doc_ids)}
    if args.doc_id not in doc_index:
        raise SystemExit(
            f"{args.doc_id!r}'s source ({doc_row['source']!r}) isn't --source "
            f"({args.source!r}) or a --target-source {args.target_sources} -- "
            "the document-candidate matrix doesn't include it."
        )
    doc_matrix = l2_normalize(stack_embeddings(relevant["embedding"]))
    is_candidate = relevant["source"].isin(args.target_sources).to_numpy()
    metadata = relevant.set_index("id")[["title", "slug", "source"]]

    print(
        f"\n--- Document candidates (widened pool: top {args.doc_pool}, "
        f"sources: {', '.join(args.target_sources)}, "
        f"gated by: {args.similarity_metric}, facet basis: {args.facet_basis}) ---"
    )
    doc_table, doc_excluded = explain_document_candidates(
        args.doc_id,
        doc_matrix,
        doc_ids,
        doc_index,
        is_candidate,
        metadata,
        doc_profiles,
        doc_facet_index,
        doc_to_l2,
        own_l2,
        own_l1,
        l2_to_l1,
        pool_size=args.doc_pool,
        top_k=args.doc_top_k,
        min_similarity=args.min_similarity,
        similarity_metric=args.similarity_metric,
        facet_basis=args.facet_basis,
        facet_match_threshold=args.facet_match_threshold,
        weights=weights,
    )
    _print_table(
        doc_table,
        [
            "rank",
            "doc_id",
            "title",
            "source",
            "candidate_l2",
            "source_affinity",
            "embedding_similarity",
            "facet_max_similarity",
            "n_shared_canonical_facets",
            "shared_canonical_facets",
            "confidence",
            "selected",
        ],
    )
    print(f"excluded elsewhere: {doc_excluded}")

    if args.candidates:
        print(
            f"\n--- Requested candidates "
            f"(gated by: {args.similarity_metric}, facet basis: {args.facet_basis}) ---"
        )
        for candidate_id in args.candidates:
            candidate_type = locate_candidate(candidate_id, l2_to_l1, doc_index)
            if candidate_type == "l2":
                result = explain_l2_candidate(
                    candidate_id,
                    doc_embedding,
                    own_l2,
                    signatures,
                    doc_profile,
                    l2_profiles,
                    l2_to_l1,
                    pool_size=args.l2_pool,
                    top_k=args.l2_top_k,
                    min_similarity=args.min_similarity,
                    weights=weights,
                )
            else:
                result = explain_document_candidate(
                    candidate_id,
                    args.doc_id,
                    doc_matrix,
                    doc_ids,
                    doc_index,
                    is_candidate,
                    metadata,
                    doc_profiles,
                    doc_to_l2,
                    l2_to_l1,
                    doc_facet_index,
                    pool_size=args.doc_pool,
                    top_k=args.doc_top_k,
                    min_similarity=args.min_similarity,
                    similarity_metric=args.similarity_metric,
                    facet_basis=args.facet_basis,
                    facet_match_threshold=args.facet_match_threshold,
                    facet_score_threshold=args.facet_score_threshold,
                    weights=weights,
                )
            print_candidate_explanation(result)

    print(
        "\n--- Final combined selection "
        "(exactly what l2 links recommend would export for this document) ---"
    )
    selected_l2 = l2_table[l2_table["selected"]] if not l2_table.empty else l2_table
    selected_doc = (
        doc_table[doc_table["selected"]] if not doc_table.empty else doc_table
    )
    combined_rows = [
        {
            "type": "l2",
            "candidate": r["l2"],
            "id": r["l2"],
            "source": "",
            "n_shared": r["n_shared_canonical_facets"],
            "is_document": False,
            "source_affinity": "not_applicable",
            "similarity": r["embedding_similarity"],
            "confidence": r["confidence"],
        }
        for _, r in selected_l2.iterrows()
    ] + [
        {
            "type": "document",
            "candidate": r["title"],
            "id": r["doc_id"],
            "source": r["source"],
            "n_shared": r["n_shared_canonical_facets"],
            "is_document": True,
            "source_affinity": r["source_affinity"],
            "similarity": r[
                "embedding_similarity"
                if args.similarity_metric == "doc"
                else "facet_max_similarity"
            ],
            "confidence": r["confidence"],
        }
        for _, r in selected_doc.iterrows()
    ]
    if not combined_rows:
        print("(nothing selected -- this document would show as 'no_candidates')")
        return
    combined = pd.DataFrame(combined_rows)
    combined["combined_score"] = combined.apply(
        lambda r: combined_score(
            r["n_shared"],
            r["is_document"],
            r["source_affinity"],
            r["similarity"],
            weights=weights,
        ),
        axis=1,
    )
    combined = combined.sort_values("combined_score", ascending=False)
    combined.index = range(1, len(combined) + 1)
    print(combined.to_string())


if __name__ == "__main__":
    main()
