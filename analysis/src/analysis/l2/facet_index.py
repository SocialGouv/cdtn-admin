"""Facet-level indices and matching helpers shared by the links and audit steps.

Pure logic over ``facets.csv`` embeddings: per-document / per-L2 facet indices,
pairwise greedy overlap and bridge search.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from analysis.l2.signatures.core import (
    greedy_matches,
    l2_normalize,
    stack_embeddings,
    topk_mean_facet_similarity,
)


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
    """:func:`analysis.l2.signatures.topk_mean_facet_similarity` from
    ``doc_id`` to every id in ``doc_ids``, in order -- the array form used
    to gate/rank a whole candidate pool by facet-level similarity instead
    of whole-document cosine similarity. A ``doc_id`` missing from
    ``doc_facet_index`` (no facets of the selected types) scores ``-inf``
    against everything.
    """
    empty = np.empty((0, 0))
    own = doc_facet_index.get(doc_id, {}).get("embeddings", empty)
    return np.array(
        [
            topk_mean_facet_similarity(
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
    shared without needing :mod:`analysis.l2.facets.canonicalize` to have
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
