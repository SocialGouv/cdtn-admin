"""Audit use case 1: documents that may belong to a different L2.

Pure logic, no I/O. Optionally corroborated by co-click sessions (a list of
lists of document ids, see :mod:`analysis.l2.sessions.build`).
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from analysis.l2.signatures.core import (
    L2Signature,
    validate_self_consistency,
)


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
