"""L2 signature building.

Builds one semantic "signature" vector per L2 (sub-theme) class, combining:

  - a contamination-robust centroid of member documents' embeddings
  - salience-weighted facet centroids (split by type: entity/topic/claim)
  - shrinkage toward the L1 parent for small/sparse L2 classes

The resulting signatures are compared (cosine similarity) against document
embeddings or free-text question embeddings — the same underlying primitive
behind all three use cases in :mod:`analysis.l2.use_cases`: "is this doc
misclassified", "which L2s are complementary", "which L2 best answers this
question".

Pure, network-free logic — no I/O, no LLM/HTTP calls. Input schemas match
:mod:`analysis.l2.io`: ``docs_df`` (id, embedding, l2, + metadata),
``facets_df`` (doc_id, text, embedding, salience, type), ``l2_to_l1``.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

FACET_TYPES = ("entity", "topic", "claim")


# ---------------------------------------------------------------------------
# Low level helpers
# ---------------------------------------------------------------------------


def stack_embeddings(embeddings) -> np.ndarray:
    """Stack a Series/list of 1D embeddings into a 2D matrix."""
    return np.vstack(list(embeddings))


def l2_normalize(matrix: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return matrix / norms


def cosine_sim_matrix(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Cosine similarity between every row of a and every row of b."""
    return l2_normalize(a) @ l2_normalize(b).T


def topk_mean_facet_similarity(
    a_embeddings: np.ndarray, b_embeddings: np.ndarray, k: int = 2
) -> float:
    """Mean of the top-``k`` cosine similarities across every (a-facet,
    b-facet) pair.

    Both inputs are expected already L2-normalized. A finer-grained "did
    several facets nearly match" signal than whole-document cosine
    similarity -- useful when a long, multi-topic document's own embedding
    is too diluted to sit close to a narrowly-focused candidate that
    matches on several of its facets. ``-inf`` if either side has no
    facets, so it always fails a similarity floor rather than needing a
    special case.

    Deliberately a top-``k`` mean, not the single highest pair (``k=1``):
    two otherwise-unrelated documents can share one coincidentally close
    facet (a generic entity mention like "CPAM" or "SMIC" turns up across
    many unrelated topics), which let a single match alone inflate
    similarity. Requiring ``k=2`` well-matched facets -- validated against
    9 hand-labeled preference pairs, where it improved the desired
    candidate's rank in 7/9 cases and cut spurious ``>=0.95`` matches from
    20 down to 1 -- is far more robust without losing the diluted-document
    rescue this metric exists for.
    """
    if len(a_embeddings) == 0 or len(b_embeddings) == 0:
        return float("-inf")
    sims = (a_embeddings @ b_embeddings.T).flatten()
    top = np.sort(sims)[-k:] if len(sims) >= k else sims
    return float(top.mean())


def greedy_matches(
    sim_matrix: np.ndarray, threshold: float
) -> list[tuple[int, int, float]]:
    """Greedy bipartite matching over a similarity matrix.

    Considers every (row, col) pair highest-similarity first; accepts a pair
    if it clears ``threshold`` AND neither its row nor its column has
    already been claimed by a higher-similarity pair. This is the dedup
    that a plain "count every cell above threshold" lacks -- one broad row
    that's vaguely close to three near-duplicate columns shouldn't count as
    three matches. Returns ``(row_idx, col_idx, similarity)`` triples,
    highest similarity first.
    """
    if sim_matrix.size == 0:
        return []
    flat_order = np.argsort(sim_matrix.ravel())[::-1]
    rows, cols = np.unravel_index(flat_order, sim_matrix.shape)
    used_rows: set[int] = set()
    used_cols: set[int] = set()
    matches: list[tuple[int, int, float]] = []
    for i, j in zip(rows.tolist(), cols.tolist(), strict=True):
        sim = float(sim_matrix[i, j])
        if sim < threshold:
            break  # sorted descending -- nothing further clears the bar either
        if i in used_rows or j in used_cols:
            continue
        used_rows.add(i)
        used_cols.add(j)
        matches.append((i, j, sim))
    return matches


def blend_vectors(vectors_weights: list[tuple[np.ndarray | None, float]]) -> np.ndarray:
    """Weighted mean of unit vectors, re-normalized to unit length."""
    pairs = [(v, w) for v, w in vectors_weights if v is not None and w > 0]
    if not pairs:
        raise ValueError("No valid vectors to blend.")
    stacked = np.vstack([v for v, _ in pairs])
    weights = np.array([w for _, w in pairs], dtype=float)
    mean = np.average(stacked, axis=0, weights=weights)
    norm = np.linalg.norm(mean)
    return mean / max(norm, 1e-9)


# ---------------------------------------------------------------------------
# Doc-level centroid, with contamination-robust trimming
# ---------------------------------------------------------------------------


@dataclass
class DocCentroidResult:
    centroid: np.ndarray  # unit-norm centroid direction
    coherence: float  # norm of the raw mean -> class tightness diagnostic
    n_docs: int
    kept_doc_ids: list
    dropped_doc_ids: list


def compute_doc_centroid(
    doc_ids: np.ndarray,
    embeddings: np.ndarray,
    trim_fraction: float = 0.1,
    n_passes: int = 2,
    min_docs_to_trim: int = 5,
) -> DocCentroidResult:
    """
    Robust centroid for one L2's member document embeddings.

    1. Normalize all vectors to unit length.
    2. Raw mean's norm = coherence diagnostic (near 1 -> tight class,
       near 0 -> diffuse class / possibly multi-modal).
    3. Iteratively drop the worst-aligned `trim_fraction` of docs for a
       couple of passes, to reduce the pull of likely-misclassified
       outliers on the very centroid used to detect them.
    """
    emb = l2_normalize(np.asarray(embeddings, dtype=float))
    ids = np.asarray(doc_ids)
    kept_mask = np.ones(len(ids), dtype=bool)

    if len(ids) < min_docs_to_trim:
        raw_mean = emb.mean(axis=0)
        coherence = float(np.linalg.norm(raw_mean))
        centroid = raw_mean / max(coherence, 1e-9)
        return DocCentroidResult(centroid, coherence, len(ids), ids.tolist(), [])

    for _ in range(n_passes):
        active_emb = emb[kept_mask]
        raw_mean = active_emb.mean(axis=0)
        coherence = float(np.linalg.norm(raw_mean))
        centroid = raw_mean / max(coherence, 1e-9)

        sims = emb @ centroid
        n_to_drop = max(1, int(len(ids) * trim_fraction))
        kept_idx = np.where(kept_mask)[0]
        worst_kept = kept_idx[np.argsort(sims[kept_idx])[:n_to_drop]]

        new_mask = kept_mask.copy()
        new_mask[worst_kept] = False
        if new_mask.sum() < max(3, len(ids) // 2):
            break  # safety: never trim away more than half the class
        kept_mask = new_mask

    active_emb = emb[kept_mask]
    raw_mean = active_emb.mean(axis=0)
    coherence = float(np.linalg.norm(raw_mean))
    centroid = raw_mean / max(coherence, 1e-9)

    return DocCentroidResult(
        centroid=centroid,
        coherence=coherence,
        n_docs=len(ids),
        kept_doc_ids=ids[kept_mask].tolist(),
        dropped_doc_ids=ids[~kept_mask].tolist(),
    )


# ---------------------------------------------------------------------------
# Facet aggregation (salience-weighted, split by type)
# ---------------------------------------------------------------------------


def aggregate_facets(
    facets_df: pd.DataFrame,
    doc_ids: list,
    doc_id_col: str = "doc_id",
    embedding_col: str = "embedding",
    salience_col: str = "salience",
    type_col: str = "type",
) -> dict:
    """
    Salience-weighted facet centroid, computed separately per type, over
    the given set of documents.
    Returns {type: {"centroid": np.ndarray | None, "n_facets": int}}.
    """
    subset = facets_df[facets_df[doc_id_col].isin(doc_ids)]
    result = {}
    for ftype in FACET_TYPES:
        rows = subset[subset[type_col] == ftype]
        if len(rows) == 0:
            result[ftype] = {"centroid": None, "n_facets": 0}
            continue
        emb = l2_normalize(stack_embeddings(rows[embedding_col]))
        weights = np.clip(rows[salience_col].to_numpy(dtype=float), a_min=0, a_max=None)
        if weights.sum() == 0:
            weights = np.ones_like(weights)
        weighted_mean = np.average(emb, axis=0, weights=weights)
        norm = np.linalg.norm(weighted_mean)
        result[ftype] = {
            "centroid": weighted_mean / max(norm, 1e-9),
            "n_facets": len(rows),
        }
    return result


def top_recurring_facets(
    facets_df: pd.DataFrame,
    doc_ids: list,
    top_n: int = 10,
    doc_id_col: str = "doc_id",
    text_col: str = "text",
    salience_col: str = "salience",
    type_col: str = "type",
) -> pd.DataFrame:
    """Most representative facets of a class, ranked by frequency x avg salience."""
    subset = facets_df[facets_df[doc_id_col].isin(doc_ids)]
    agg = (
        subset.groupby([type_col, text_col])[salience_col]
        .agg(["count", "mean"])
        .rename(columns={"count": "frequency", "mean": "avg_salience"})
    )
    agg["score"] = agg["frequency"] * agg["avg_salience"]
    return (
        agg.sort_values("score", ascending=False)
        .groupby(level=0)
        .head(top_n)
        .reset_index()
    )


def top_representative_docs(
    docs_df: pd.DataFrame,
    doc_ids: list,
    reference_vector: np.ndarray,
    top_n: int = 5,
    doc_id_col: str = "id",
    embedding_col: str = "embedding",
    metadata_cols: tuple = ("title", "slug", "source"),
) -> pd.DataFrame:
    """The class's documents sitting closest to a reference vector.

    Typically ``reference_vector=signatures[l2].doc_centroid``.
    """
    subset = docs_df[docs_df[doc_id_col].isin(doc_ids)].copy()
    emb = l2_normalize(stack_embeddings(subset[embedding_col]))
    ref = reference_vector / max(np.linalg.norm(reference_vector), 1e-9)
    subset["similarity"] = emb @ ref
    cols = [
        doc_id_col,
        *[c for c in metadata_cols if c in subset.columns],
        "similarity",
    ]
    return (
        subset[cols]
        .sort_values("similarity", ascending=False)
        .head(top_n)
        .reset_index(drop=True)
    )


# ---------------------------------------------------------------------------
# Composite L2 signature (doc centroid + facets + shrinkage to L1)
# ---------------------------------------------------------------------------


@dataclass
class L2Signature:
    l2: str
    l1: str
    vector: np.ndarray  # final signature used for comparisons
    doc_centroid: np.ndarray
    coherence: float
    n_docs: int
    facet_centroids: dict
    kept_doc_ids: list
    dropped_doc_ids: list
    shrinkage_applied: float  # 0 = pure L2 content, 1 = fully parent


def build_l2_signatures(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    l2_to_l1: dict,
    doc_embedding_col: str = "embedding",
    doc_id_col: str = "id",
    l2_col: str = "l2",
    facet_type_weights: dict | None = None,
    shrinkage_k: float = 5.0,
    trim_fraction: float = 0.1,
) -> dict[str, L2Signature]:
    """
    Build one L2Signature per class.

    facet_type_weights: trust given to each facet type relative to the
      doc centroid's implicit weight of 1.0. Defaults favor topics over
      entities over claims (topics generalize best at class level,
      claims are usually the most document-specific).
    shrinkage_k: n_docs / (n_docs + shrinkage_k) is the weight kept on
      the L2's own content; small classes borrow more from their L1.
    """
    if facet_type_weights is None:
        facet_type_weights = {"topic": 0.30, "entity": 0.15, "claim": 0.05}

    # pass 1: doc centroid + facet aggregation per L2
    raw = {}
    for l2, group in docs_df.groupby(l2_col):
        doc_result = compute_doc_centroid(
            doc_ids=group[doc_id_col].to_numpy(),
            embeddings=stack_embeddings(group[doc_embedding_col]),
            trim_fraction=trim_fraction,
        )
        facet_centroids = aggregate_facets(facets_df, doc_result.kept_doc_ids)
        raw[l2] = {
            "doc_result": doc_result,
            "facet_centroids": facet_centroids,
            "l1": l2_to_l1[l2],
        }

    # pass 2: L1 centroids, built from children's doc centroids (size-weighted)
    l1_children: dict[str, list] = {}
    for data in raw.values():
        l1_children.setdefault(data["l1"], []).append(
            (data["doc_result"].centroid, data["doc_result"].n_docs)
        )
    l1_centroids = {l1: blend_vectors(children) for l1, children in l1_children.items()}

    # pass 3: assemble final per-L2 signature (facets folded in + shrinkage)
    signatures = {}
    for l2, data in raw.items():
        doc_result: DocCentroidResult = data["doc_result"]
        facet_centroids = data["facet_centroids"]
        l1 = data["l1"]

        blend_inputs = [(doc_result.centroid, 1.0)]
        for ftype, w in facet_type_weights.items():
            fc = facet_centroids.get(ftype, {}).get("centroid")
            if fc is not None:
                blend_inputs.append((fc, w))
        content_vector = blend_vectors(blend_inputs)

        n = doc_result.n_docs
        own_weight = n / (n + shrinkage_k)
        parent_centroid = l1_centroids.get(l1)
        if parent_centroid is not None and own_weight < 1.0:
            final_vector = blend_vectors(
                [(content_vector, own_weight), (parent_centroid, 1.0 - own_weight)]
            )
        else:
            final_vector = content_vector

        signatures[l2] = L2Signature(
            l2=l2,
            l1=l1,
            vector=final_vector,
            doc_centroid=doc_result.centroid,
            coherence=doc_result.coherence,
            n_docs=doc_result.n_docs,
            facet_centroids=facet_centroids,
            kept_doc_ids=doc_result.kept_doc_ids,
            dropped_doc_ids=doc_result.dropped_doc_ids,
            shrinkage_applied=1.0 - own_weight,
        )

    return signatures


# ---------------------------------------------------------------------------
# Scoring against signatures + self-consistency validation
# ---------------------------------------------------------------------------


def score_against_signatures(
    embedding: np.ndarray, signatures: dict[str, L2Signature]
) -> pd.DataFrame:
    """Cosine similarity of one embedding (doc/question) against every L2 signature."""
    l2s = list(signatures.keys())
    matrix = np.vstack([signatures[l2].vector for l2 in l2s])
    sims = cosine_sim_matrix(embedding.reshape(1, -1), matrix)[0]
    return (
        pd.DataFrame({"l2": l2s, "similarity": sims})
        .sort_values("similarity", ascending=False)
        .reset_index(drop=True)
    )


def validate_self_consistency(
    docs_df: pd.DataFrame,
    signatures: dict[str, L2Signature],
    doc_embedding_col: str = "embedding",
    doc_id_col: str = "id",
    l2_col: str = "l2",
    metadata_cols: tuple = ("title", "slug", "source"),
) -> pd.DataFrame:
    """
    For every document, rank its assigned L2 against all signatures.
    A poor rank / negative margin is a misclassification *candidate* --
    but a whole L2 showing up repeatedly on the losing side may instead
    mean that class's signature is weak or overlapping with a neighbor,
    which is a taxonomy issue rather than a per-document one.
    """
    l2s = list(signatures.keys())
    sig_matrix = l2_normalize(np.vstack([signatures[l2].vector for l2 in l2s]))
    doc_matrix = l2_normalize(stack_embeddings(docs_df[doc_embedding_col]))
    sims = doc_matrix @ sig_matrix.T  # n_docs x n_l2

    l2_index = {l2: i for i, l2 in enumerate(l2s)}
    present_metadata = [c for c in metadata_cols if c in docs_df.columns]
    rows = []
    for i, (_, row) in enumerate(docs_df.iterrows()):
        own_l2 = row[l2_col]
        own_idx = l2_index[own_l2]
        own_sim = sims[i, own_idx]
        best_idx = np.argmax(sims[i])
        rows.append(
            {
                "doc_id": row[doc_id_col],
                **{col: row[col] for col in present_metadata},
                "assigned_l2": own_l2,
                "assigned_similarity": own_sim,
                "best_l2": l2s[best_idx],
                "best_similarity": sims[i, best_idx],
                "rank_of_assigned": int((sims[i] > own_sim).sum()) + 1,
                "margin": own_sim
                - sims[i, best_idx],  # 0 if assigned is best, negative otherwise
            }
        )
    return pd.DataFrame(rows).sort_values("margin")


def misclassification_rate_by_source(
    validation_report: pd.DataFrame,
    source_col: str = "source",
    margin_threshold: float = 0.0,
) -> pd.DataFrame:
    """
    Breaks the self-consistency report down by document source, to check
    whether flagged documents cluster around one feed/ingestion source
    rather than being spread evenly. A source with a much higher flag
    rate than the rest points to an upstream data-quality issue (e.g. a
    broken auto-labeling rule for that feed) -- a different problem, and
    a different fix, than a handful of individually mislabeled documents.
    """
    if source_col not in validation_report.columns:
        raise ValueError(
            f"'{source_col}' not in validation_report -- pass metadata_cols "
            f"including '{source_col}' to validate_self_consistency first."
        )
    flagged = validation_report["margin"] < margin_threshold
    summary = (
        validation_report.assign(flagged=flagged)
        .groupby(source_col)
        .agg(n_docs=("flagged", "size"), n_flagged=("flagged", "sum"))
    )
    summary["flag_rate"] = summary["n_flagged"] / summary["n_docs"]
    return summary.sort_values("flag_rate", ascending=False)
