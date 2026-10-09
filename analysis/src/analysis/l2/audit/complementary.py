"""Audit use case 2: which other L2 classes are worth cross-linking to.

Content-only variant: facet bridge + embedding similarity, no session data.
The co-click variant lives in :mod:`analysis.l2.legacy.coclick_complementary`.
"""

from __future__ import annotations

import numpy as np
import pandas as pd

from analysis.l2.config import COMPLEMENTARY_FACET_WEIGHT
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


def add_complementary_l2_columns_content_only(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    doc_to_l2: dict,
    doc_id_col: str = "id",
    doc_embedding_col: str = "embedding",
    facet_types: tuple = ("entity", "topic"),
    bridge_top_n: int = 5,
    facet_weight: float = COMPLEMENTARY_FACET_WEIGHT,
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
