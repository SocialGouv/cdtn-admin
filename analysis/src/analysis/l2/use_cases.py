"""The three L2 editorial use cases, built on top of :mod:`analysis.l2.signatures`.

  1. :func:`add_misclassification_columns` -- documents that may belong to a
     different L2 than the one they're assigned to.
  2. :func:`add_complementary_l2_columns` /
     :func:`add_complementary_l2_columns_content_only` -- for each document,
     which OTHER L2 classes are worth cross-linking to.
     Two variants: the first ranks by co-click behavior (sessions), the second
     by facet-bridge + embedding similarity alone (no session data needed) --
     see their docstrings for when to use which.
  3. :func:`add_question_l2_columns` -- free-text question -> best 2 L2 classes.

Pure, network-free logic -- no I/O, no LLM/HTTP calls. Session dataset: a list
of lists of document ids, e.g. ``[["d1", "d2"], ["d3", "d4", "d5"], ...]``;
order doesn't matter, sessions are typically 2-6 documents (see
:mod:`analysis.l2.build_sessions`).
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from analysis.l2.signatures import (
    L2Signature,
    greedy_matches,
    l2_normalize,
    max_facet_similarity,
    stack_embeddings,
    validate_self_consistency,
)

# ---------------------------------------------------------------------------
# Session (co-click) structures
# ---------------------------------------------------------------------------


def sessions_to_long_df(sessions: list[list]) -> pd.DataFrame:
    """Turn [[d1, d2], [d3, d4, d5], ...] into a long (session_id, doc_id) table."""
    rows = [
        (session_id, doc_id)
        for session_id, session in enumerate(sessions)
        for doc_id in session
    ]
    return pd.DataFrame(rows, columns=["session_id", "doc_id"])


def check_session_doc_coverage(sessions_long: pd.DataFrame, doc_to_l2: dict) -> dict:
    """
    Diagnostic: checks whether every doc_id referenced in sessions_long
    successfully maps to an L2 via doc_to_l2.

    The most common real-data failure mode here is a dtype mismatch
    between the session log's doc_ids and docs_df's id column (e.g. one
    side has int ids, the other has the same ids as strings) -- often
    because one category's documents came from a different ingestion
    batch/source. This fails *silently*: unmapped rows just get dropped,
    which makes the affected class's row vanish entirely from
    build_l2_coclick_matrix's output, looking exactly like "this class
    has zero session coverage" even when it doesn't. Call this before
    build_l2_coclick_matrix to catch that case explicitly.
    """
    mapped = sessions_long["doc_id"].map(doc_to_l2)
    unmapped_mask = mapped.isna()
    n_unmapped = int(unmapped_mask.sum())
    unmapped_ids = sessions_long.loc[unmapped_mask, "doc_id"].unique().tolist()

    if n_unmapped > 0:
        sample_key = next(iter(doc_to_l2))
        sample_session_id = sessions_long["doc_id"].iloc[0]
        print(
            f"WARNING: {n_unmapped} session rows reference doc_ids with no entry in "
            f"doc_to_l2 ({len(unmapped_ids)} distinct ids, e.g. {unmapped_ids[:5]}). "
            f"This is usually a dtype mismatch -- doc_to_l2 keys look like "
            f"{type(sample_key).__name__} (e.g. {sample_key!r}) while sessions' "
            f"doc_ids look like {type(sample_session_id).__name__} "
            f"(e.g. {sample_session_id!r}). Affected classes will silently "
            f"appear to have zero co-click coverage."
        )
    return {"n_unmapped_rows": n_unmapped, "unmapped_doc_ids": unmapped_ids}


def build_l2_coclick_matrix(
    sessions_long: pd.DataFrame,
    doc_to_l2: dict,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.Series]:
    """
    Class-level co-occurrence from session logs.

    Returns:
      raw_counts  - L2 x L2 matrix, symmetric, count of sessions in which
                    a document of class A and a document of class B (A may
                    equal B) were both viewed
      lift        - raw_counts / expected_counts_under_independence.
                    lift > 1 means A and B are viewed together more than
                    chance would predict; an approximate heuristic (each
                    session's C(n,2) pairs treated as independent draws),
                    good enough for ranking, not a rigorous statistical test
      l2_marginal - how many (doc, session) slots each L2 occupied overall
    """
    df = sessions_long.copy()
    df["l2"] = df["doc_id"].map(doc_to_l2)

    merged = df.merge(df, on="session_id", suffixes=("_a", "_b"))
    merged = merged[merged["doc_id_a"] < merged["doc_id_b"]]  # each unordered pair once

    pair_counts = merged.groupby(["l2_a", "l2_b"]).size().rename("count").reset_index()

    l2_labels = sorted(df["l2"].dropna().unique())
    raw = pd.DataFrame(0.0, index=l2_labels, columns=l2_labels)
    for _, row in pair_counts.iterrows():
        a, b, c = row["l2_a"], row["l2_b"], row["count"]
        raw.loc[a, b] += c
        if a != b:
            raw.loc[b, a] += c

    l2_marginal = df["l2"].value_counts()
    total_slots = l2_marginal.sum()
    total_pairs = merged.shape[0]

    expected = pd.DataFrame(0.0, index=l2_labels, columns=l2_labels)
    for a in l2_labels:
        for b in l2_labels:
            pa = l2_marginal.get(a, 0) / total_slots
            pb = l2_marginal.get(b, 0) / total_slots
            expected.loc[a, b] = total_pairs * pa * pb * (1 if a == b else 2)

    lift = raw / expected.replace(0, np.nan)
    return raw, lift, l2_marginal


def build_all_docs_coview_l2_profiles(
    sessions_long: pd.DataFrame, doc_to_l2: dict
) -> dict:
    """
    Vectorized precomputation of every document's co-view L2 profile in a
    single self-join. Returns {doc_id: (l2_counts: pd.Series, n_sessions: int)}.
    """
    df = sessions_long.copy()
    df["l2"] = df["doc_id"].map(doc_to_l2)

    merged = df.merge(df, on="session_id", suffixes=("_self", "_other"))
    merged = merged[merged["doc_id_self"] != merged["doc_id_other"]]

    counts = (
        merged.groupby(["doc_id_self", "l2_other"]).size().rename("count").reset_index()
    )
    n_sessions = df.groupby("doc_id")["session_id"].nunique()

    profiles = {}
    for doc_id, group in counts.groupby("doc_id_self"):
        profiles[doc_id] = (
            group.set_index("l2_other")["count"],
            int(n_sessions.get(doc_id, 0)),
        )
    return profiles


# ---------------------------------------------------------------------------
# Facet bridge search (precomputed indices -- cheap enough to run per doc)
# ---------------------------------------------------------------------------


def build_class_facet_index(
    facets_df: pd.DataFrame,
    doc_to_l2: dict,
    facet_types: tuple = ("claim", "topic"),
    facet_doc_id_col: str = "doc_id",
) -> dict:
    """Precompute, once, every L2's stacked facet embeddings/texts/doc_ids.

    Speeds up the repeated per-document lookups in :func:`facet_bridge_pairs`.
    """
    df = facets_df[facets_df["type"].isin(facet_types)].copy()
    df["l2"] = df[facet_doc_id_col].map(doc_to_l2)
    index = {}
    for l2, group in df.groupby("l2"):
        index[l2] = {
            "embeddings": l2_normalize(stack_embeddings(group["embedding"])),
            "texts": group["text"].to_numpy(),
            "doc_ids": group[facet_doc_id_col].to_numpy(),
        }
    return index


def build_doc_facet_index(
    facets_df: pd.DataFrame,
    facet_types: tuple = ("entity", "topic"),
    facet_doc_id_col: str = "doc_id",
) -> dict:
    """Precompute, once, every document's stacked facet embeddings/texts.

    Speeds up the repeated per-document lookups in :func:`facet_bridge_pairs`.
    """
    df = facets_df[facets_df["type"].isin(facet_types)]
    index = {}
    for doc_id, group in df.groupby(facet_doc_id_col):
        index[doc_id] = {
            "embeddings": l2_normalize(stack_embeddings(group["embedding"])),
            "texts": group["text"].to_numpy(),
        }
    return index


def facet_max_similarities(
    doc_id: str, doc_ids: list[str], doc_facet_index: dict
) -> np.ndarray:
    """:func:`analysis.l2.signatures.max_facet_similarity` from ``doc_id`` to
    every id in ``doc_ids``, in order -- the array form used to gate/rank a
    whole candidate pool by facet-level similarity instead of whole-document
    cosine similarity. A ``doc_id`` missing from ``doc_facet_index`` (no
    facets of the selected types) scores ``-inf`` against everything.
    """
    empty = np.empty((0, 0))
    own = doc_facet_index.get(doc_id, {}).get("embeddings", empty)
    return np.array(
        [
            max_facet_similarity(
                own, doc_facet_index.get(target_id, {}).get("embeddings", empty)
            )
            for target_id in doc_ids
        ]
    )


def facet_greedy_overlap(
    doc_id_a: str,
    doc_id_b: str,
    doc_facet_index: dict,
    *,
    threshold: float,
) -> tuple[int, list[tuple[str, str, float]]]:
    """Shared facets between two documents via greedy embedding matching.

    The embedding-based analog of
    :func:`analysis.l2.recommend_links.canonical_overlap`'s
    ``(n_shared, shared)`` -- but where that one intersects two documents'
    *identical* text labels, this greedily pairs (see
    :func:`analysis.l2.signatures.greedy_matches`) each of document A's
    facets to at most one of document B's, at >= ``threshold`` cosine
    similarity, so two differently-worded paraphrases can still count as
    shared without needing :mod:`analysis.l2.canonicalize_facets` to have
    pre-clustered them. ``shared`` is ``(a_text, b_text, similarity)``
    triples, highest similarity first, since the two sides aren't the same
    string to just print once like canonical/raw overlap can.
    """
    a = doc_facet_index.get(doc_id_a)
    b = doc_facet_index.get(doc_id_b)
    if not a or not b or len(a["embeddings"]) == 0 or len(b["embeddings"]) == 0:
        return 0, []
    sims = a["embeddings"] @ b["embeddings"].T
    shared = [
        (str(a["texts"][i]), str(b["texts"][j]), sim)
        for i, j, sim in greedy_matches(sims, threshold)
    ]
    return len(shared), shared


def facet_pairs_above_threshold(
    doc_id_a: str,
    doc_id_b: str,
    doc_facet_index: dict,
    *,
    threshold: float,
) -> list[tuple[str, str, float]]:
    """Every (a-facet, b-facet) pair at >= ``threshold`` cosine similarity.

    Highest similarity first. Unlike :func:`facet_greedy_overlap`, this is
    NOT deduped to one match per facet -- it's the full comparison space,
    for inspecting exactly what was compared to what. A source facet close
    to several of the candidate's facets shows up once per pair, which is
    the point: greedy overlap already answers "how many are shared", this
    answers "why", scores included.
    """
    a = doc_facet_index.get(doc_id_a)
    b = doc_facet_index.get(doc_id_b)
    if not a or not b or len(a["embeddings"]) == 0 or len(b["embeddings"]) == 0:
        return []
    sims = a["embeddings"] @ b["embeddings"].T
    flat_order = np.argsort(sims.ravel())[::-1]
    rows, cols = np.unravel_index(flat_order, sims.shape)
    pairs = []
    for i, j in zip(rows.tolist(), cols.tolist(), strict=True):
        sim = float(sims[i, j])
        if sim < threshold:
            break  # sorted descending -- nothing further clears the bar either
        pairs.append((str(a["texts"][i]), str(b["texts"][j]), sim))
    return pairs


def facet_bridge_pairs(
    doc_id,
    target_l2: str,
    doc_facet_index: dict,
    class_facet_index: dict,
    top_n: int = 5,
) -> list[dict]:
    """
    Fine-grained explanation for why target_l2 might be complementary to
    doc_id: the individual facet pairs (this doc's facet <-> a facet
    already in target_l2) with the highest embedding similarity. Since
    facets aren't deduped or ID-linked across documents, a high match
    usually means the same real-world entity/topic came up independently
    in both places -- a specific, checkable bridge that a class-level
    centroid comparison alone can't show.

    Returns up to top_n *distinct* (own_facet_text, matched_facet_text)
    pairs -- the same recurring word matching many documents in the
    target class counts once, not once per document, so it can't crowd
    out other genuine bridges.

    Uses precomputed indices (build_doc_facet_index / build_class_facet_index)
    so this is cheap enough to run automatically for every document.
    """
    own = doc_facet_index.get(doc_id)
    target = class_facet_index.get(target_l2)
    if (
        not own
        or not target
        or len(own["embeddings"]) == 0
        or len(target["embeddings"]) == 0
    ):
        return []

    sims = own["embeddings"] @ target["embeddings"].T
    flat_order = np.argsort(sims.ravel())[::-1]
    max_scan = min(len(flat_order), top_n * 200)  # safety cap on pathological cases

    results = []
    seen_pairs = set()
    for idx in flat_order[:max_scan]:
        i, j = np.unravel_index(idx, sims.shape)
        key = (own["texts"][i], target["texts"][j])
        if key in seen_pairs:
            continue
        seen_pairs.add(key)
        results.append(
            {
                "own_facet": own["texts"][i],
                "matched_facet": target["texts"][j],
                "matched_doc_id": target["doc_ids"][j],
                "similarity": float(sims[i, j]),
            }
        )
        if len(results) >= top_n:
            break
    return results


# ---------------------------------------------------------------------------
# Batch entry points -- the three use cases, run over a whole dataframe
# ---------------------------------------------------------------------------


def add_misclassification_columns(
    docs_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    sessions_long: pd.DataFrame,
    doc_to_l2: dict,
    doc_id_col: str = "id",
    doc_embedding_col: str = "embedding",
    l2_col: str = "l2",
    margin_threshold: float = 0.0,
) -> pd.DataFrame:
    """
    Use case 1. Adds two columns to a copy of docs_df:

      better_l2         - the alternative L2 label if one scores higher
                           than the assigned class (by more than
                           margin_threshold), otherwise None. Non-null
                           IS the "yes, a better one exists" signal.
      l2_scoring_details - one dict per row with every computed score:
                           assigned_l2, assigned_similarity, best_l2,
                           best_similarity, rank_of_assigned, margin,
                           coclick_corroboration. Filled for every row,
                           not just flagged ones.
    """
    report = validate_self_consistency(
        docs_df,
        signatures,
        doc_embedding_col=doc_embedding_col,
        doc_id_col=doc_id_col,
        l2_col=l2_col,
    )

    profiles = build_all_docs_coview_l2_profiles(sessions_long, doc_to_l2)
    corroboration = {}
    for _, row in report.iterrows():
        profile, n_sessions = profiles.get(row["doc_id"], (pd.Series(dtype=float), 0))
        if n_sessions == 0 or profile.sum() == 0:
            corroboration[row["doc_id"]] = np.nan
            continue
        share = profile / profile.sum()
        corroboration[row["doc_id"]] = share.get(row["best_l2"], 0.0) - share.get(
            row["assigned_l2"], 0.0
        )
    report["coclick_corroboration"] = report["doc_id"].map(corroboration)

    report["better_l2"] = np.where(
        report["margin"] < margin_threshold, report["best_l2"], None
    )

    scoring_cols = [
        "assigned_l2",
        "assigned_similarity",
        "best_l2",
        "best_similarity",
        "rank_of_assigned",
        "margin",
        "coclick_corroboration",
    ]
    report["l2_scoring_details"] = report[scoring_cols].to_dict(orient="records")

    new_cols = report[["doc_id", "better_l2", "l2_scoring_details"]].rename(
        columns={"doc_id": doc_id_col}
    )
    return docs_df.merge(new_cols, on=doc_id_col, how="left")


def add_complementary_l2_columns(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    sessions_long: pd.DataFrame,
    doc_to_l2: dict,
    l2_coclick_lift: pd.DataFrame,
    doc_id_col: str = "id",
    doc_embedding_col: str = "embedding",
    shrinkage_k: float = 3.0,
    bridge_top_n: int = 5,
) -> pd.DataFrame:
    """
    Use case 2, co-click variant. Adds five columns to a copy of docs_df:

      complementary_l2_1, complementary_l2_2 - top 2 candidates, ranked
        by behavioral (co-click) score with shrinkage toward the class-
        level co-click row for documents with few sessions of their own;
        any L2 more similar (by whole-doc embedding) than the doc's own
        assigned class is excluded (that's misclassification territory,
        use case 1, not complementarity).

      complementary_l2_1_bridge, complementary_l2_2_bridge - the facet-
        level evidence for each of the two picks: the specific facet
        pairs (this doc's facet <-> a facet from a document already in
        that class) with the highest similarity. Computed automatically
        for every document via precomputed facet indices, rather than
        being a separate on-demand call.

      complementary_l2_source - "co-click" if ranked by behavioral
        evidence (the normal case), or "embedding_fallback" if this
        document's L2 class has zero session coverage at all (no
        document of that class ever appears in `sessions`) -- a real
        situation for rarely-viewed/niche classes, not an edge case to
        ignore. Those rows fall back to ranking by whole-doc embedding
        similarity alone, so they still get a recommendation instead of
        silently getting nothing (or crashing).

    Needs enough session coverage to be meaningful -- see
    :func:`add_complementary_l2_columns_content_only` for a variant that
    needs no session data at all.
    """
    l2s = sorted(signatures.keys())
    l2_index = {l2: i for i, l2 in enumerate(l2s)}
    sig_matrix = l2_normalize(np.vstack([signatures[l2].vector for l2 in l2s]))

    doc_ids = docs_df[doc_id_col].tolist()
    doc_matrix = l2_normalize(stack_embeddings(docs_df[doc_embedding_col]))
    sims_all = doc_matrix @ sig_matrix.T  # (n_docs, n_l2), one matmul for everyone

    session_profiles = build_all_docs_coview_l2_profiles(sessions_long, doc_to_l2)
    class_facet_index = build_class_facet_index(facets_df, doc_to_l2)
    doc_facet_index = build_doc_facet_index(facets_df)

    complementary_1, complementary_2 = [], []
    bridge_1, bridge_2 = [], []
    source = []

    for row_idx, doc_id in enumerate(doc_ids):
        own_l2 = doc_to_l2[doc_id]
        own_similarity = sims_all[row_idx, l2_index[own_l2]]

        profile, n_sessions = session_profiles.get(doc_id, (pd.Series(dtype=float), 0))
        doc_dist = (
            (profile / profile.sum()) if profile.sum() > 0 else pd.Series(dtype=float)
        )

        if own_l2 in l2_coclick_lift.index:
            class_row = l2_coclick_lift.loc[own_l2].drop(
                labels=[own_l2], errors="ignore"
            )
            class_dist = (
                (class_row / class_row.sum())
                if class_row.sum() > 0
                else pd.Series(dtype=float)
            )
        else:
            # this L2 has zero session coverage anywhere in the logs --
            # no class-level row exists to fall back on either
            class_dist = pd.Series(dtype=float)

        own_weight = n_sessions / (n_sessions + shrinkage_k)
        has_behavioral_evidence = not doc_dist.empty or not class_dist.empty

        candidates = []
        for l2 in l2s:
            if l2 == own_l2:
                continue
            if sims_all[row_idx, l2_index[l2]] > own_similarity:
                continue  # misclassification territory, not complementary
            if has_behavioral_evidence:
                score = own_weight * doc_dist.get(l2, 0.0) + (
                    1 - own_weight
                ) * class_dist.get(l2, 0.0)
            else:
                score = sims_all[row_idx, l2_index[l2]]  # embedding-similarity fallback
            candidates.append((l2, score))
        candidates.sort(key=lambda x: x[1], reverse=True)

        l2_1 = candidates[0][0] if len(candidates) > 0 else None
        l2_2 = candidates[1][0] if len(candidates) > 1 else None
        complementary_1.append(l2_1)
        complementary_2.append(l2_2)
        bridge_1.append(
            facet_bridge_pairs(
                doc_id, l2_1, doc_facet_index, class_facet_index, bridge_top_n
            )
            if l2_1
            else []
        )
        bridge_2.append(
            facet_bridge_pairs(
                doc_id, l2_2, doc_facet_index, class_facet_index, bridge_top_n
            )
            if l2_2
            else []
        )
        source.append("co-click" if has_behavioral_evidence else "embedding_fallback")

    out = docs_df.copy()
    out["complementary_l2_1"] = complementary_1
    out["complementary_l2_2"] = complementary_2
    out["complementary_l2_1_bridge"] = bridge_1
    out["complementary_l2_2_bridge"] = bridge_2
    out["complementary_l2_source"] = source
    return out


def add_complementary_l2_columns_content_only(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    doc_to_l2: dict,
    doc_id_col: str = "id",
    doc_embedding_col: str = "embedding",
    facet_types: tuple = ("entity", "topic"),
    bridge_top_n: int = 5,
    facet_weight: float = 0.7,
) -> pd.DataFrame:
    """
    Use case 2, content-only variant: uses only whole-document embeddings
    and facets, no session/co-click data at all. Use this when session
    coverage is too sparse for :func:`add_complementary_l2_columns` to be
    meaningful (e.g. a fresh corpus, or classes with little traffic).

    Ranking logic, per document:
      1. Whole-document embedding similarity to every other L2 signature.
         Any class more similar than the doc's own assigned class is
         excluded -- that's misclassification territory (use case 1),
         not complementarity.
      2. For each remaining candidate, run the facet-bridge search (same
         mechanism as add_complementary_l2_columns's automatic bridge
         evidence) and take the strength of its single best matched pair.
      3. Rank by a weighted combination:

             combined_score = facet_weight * bridge_strength
                               + (1 - facet_weight) * embedding_similarity

         Both terms are cosine similarities, but they don't share a
         natural scale: a short 1-2 word facet phrase can hit an exact
         or near-exact match easily (bridge_strength near 1 is common),
         while a whole-document embedding, averaged over far more text,
         rarely gets that close even for a genuinely good fit. Nothing
         here normalizes the two onto a common scale -- facet_weight
         (default 0.7, leaning toward facets as the more specific,
         rarer signal) is the one knob that controls the trade-off, and
         is the first thing to retune if the two signals behave
         differently at your real scale. When a candidate has zero
         facet-bridge evidence (bridge_strength=0), the formula degrades
         gracefully to ranking by embedding similarity alone -- no
         separate fallback branch needed.

    Adds the same columns as add_complementary_l2_columns
    (complementary_l2_1, complementary_l2_2, complementary_l2_1_bridge,
    complementary_l2_2_bridge, complementary_l2_source with values
    "facet_bridge" / "embedding_fallback"), plus complementary_l2_1_score
    / complementary_l2_2_score (the combined_score behind each pick, for
    inspecting/tuning facet_weight).

    Note on cost: because the facet-bridge search itself feeds the
    ranking here, it has to run against *every* remaining candidate
    class per document, not just the eventual top 2 (unlike the
    behavioral version, which only bridges the winners). Still cheap at
    a couple thousand documents and a handful of L2 classes, but scales
    with n_docs x n_l2 rather than n_docs x 2.
    """
    l2s = sorted(signatures.keys())
    l2_index = {l2: i for i, l2 in enumerate(l2s)}
    sig_matrix = l2_normalize(np.vstack([signatures[l2].vector for l2 in l2s]))

    doc_ids = docs_df[doc_id_col].tolist()
    doc_matrix = l2_normalize(stack_embeddings(docs_df[doc_embedding_col]))
    sims_all = doc_matrix @ sig_matrix.T  # (n_docs, n_l2)

    class_facet_index = build_class_facet_index(
        facets_df, doc_to_l2, facet_types=facet_types
    )
    doc_facet_index = build_doc_facet_index(facets_df, facet_types=facet_types)

    complementary_1, complementary_2 = [], []
    bridge_1, bridge_2 = [], []
    score_1, score_2 = [], []
    source = []

    for row_idx, doc_id in enumerate(doc_ids):
        own_l2 = doc_to_l2[doc_id]
        own_similarity = sims_all[row_idx, l2_index[own_l2]]

        candidates = []
        for l2 in l2s:
            if l2 == own_l2:
                continue
            sim = sims_all[row_idx, l2_index[l2]]
            if sim > own_similarity:
                continue  # misclassification territory, not complementary
            bridges = facet_bridge_pairs(
                doc_id, l2, doc_facet_index, class_facet_index, top_n=bridge_top_n
            )
            bridge_strength = bridges[0]["similarity"] if bridges else 0.0
            combined_score = facet_weight * bridge_strength + (1 - facet_weight) * sim
            candidates.append((l2, combined_score, bridge_strength, bridges))

        candidates.sort(key=lambda c: c[1], reverse=True)

        l2_1 = candidates[0][0] if len(candidates) > 0 else None
        l2_2 = candidates[1][0] if len(candidates) > 1 else None
        complementary_1.append(l2_1)
        complementary_2.append(l2_2)
        bridge_1.append(candidates[0][3] if len(candidates) > 0 else [])
        bridge_2.append(candidates[1][3] if len(candidates) > 1 else [])
        score_1.append(candidates[0][1] if len(candidates) > 0 else np.nan)
        score_2.append(candidates[1][1] if len(candidates) > 1 else np.nan)
        has_bridge = len(candidates) > 0 and candidates[0][2] > 0
        source.append("facet_bridge" if has_bridge else "embedding_fallback")

    out = docs_df.copy()
    out["complementary_l2_1"] = complementary_1
    out["complementary_l2_2"] = complementary_2
    out["complementary_l2_1_bridge"] = bridge_1
    out["complementary_l2_2_bridge"] = bridge_2
    out["complementary_l2_1_score"] = score_1
    out["complementary_l2_2_score"] = score_2
    out["complementary_l2_source"] = source
    return out


def add_question_l2_columns(
    questions_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    embedding_col: str = "embedding",
    top_k: int = 2,
) -> pd.DataFrame:
    """
    Use case 3. Adds matched_l2_1 ... matched_l2_{top_k} to a copy of
    questions_df. Fully vectorized -- one matrix multiply against the
    L2 signatures, no per-row loop, since questions already carry
    precomputed embeddings.
    """
    l2s = list(signatures.keys())
    sig_matrix = l2_normalize(np.vstack([signatures[l2].vector for l2 in l2s]))
    q_matrix = l2_normalize(stack_embeddings(questions_df[embedding_col]))
    sims = q_matrix @ sig_matrix.T  # (n_questions, n_l2)

    top_idx = np.argsort(-sims, axis=1)[:, :top_k]
    out = questions_df.copy()
    for k in range(top_k):
        out[f"matched_l2_{k + 1}"] = [l2s[i] for i in top_idx[:, k]]
    return out
