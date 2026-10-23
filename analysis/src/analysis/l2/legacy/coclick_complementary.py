"""Legacy: co-click based complementary-L2 ranking (superseded by content-only).

Kept for reference; not exposed in the ``l2`` CLI.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from analysis.l2.audit.misclassification import build_all_docs_coview_l2_profiles
from analysis.l2.config import COCLICK_SHRINKAGE_K
from analysis.l2.facet_index import (
    build_class_facet_index,
    build_doc_facet_index,
    facet_bridge_pairs,
)
from analysis.l2.signatures.core import (
    L2Signature,
    l2_normalize,
    stack_embeddings,
)


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


def add_complementary_l2_columns(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    sessions_long: pd.DataFrame,
    doc_to_l2: dict,
    l2_coclick_lift: pd.DataFrame,
    doc_id_col: str = "id",
    doc_embedding_col: str = "embedding",
    shrinkage_k: float = COCLICK_SHRINKAGE_K,
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
