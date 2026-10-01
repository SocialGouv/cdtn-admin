"""L2 pipeline, tuning tool: fit combined_score's weights from a small list
of (source_doc_id, desired_candidate_id) preferences.

For each source document you provide, gathers every OTHER document
candidate from the target sources (unfiltered by ``--min-similarity`` --
a labeled preference might currently sit below that floor, which is
exactly the case a fit needs to see, not lose) and builds one training
pair per (your desired candidate, some other candidate): the desired one
should score higher. Those pairs feed a small, regularized fit that
corrects :data:`analysis.l2.recommend_links.DEFAULT_SCORE_WEIGHTS`.

Two things this tool deliberately does NOT do, both because the input is a
short, document-only preference list:

1. It never touches the ``is_document`` weight. Every training pair
   compares two document candidates, so that feature is identical on both
   sides of every pair -- zero gradient, nothing to fit. If you ever have
   an example where an L2 candidate should beat a document, this tool
   would need extending to use it.
2. It doesn't fit the other three weights (``n_shared_canonical_facets``,
   ``source_affinity``, ``embedding_similarity``) from scratch. Plain
   logistic regression regularizes toward zero weights, which would let a
   handful of noisy examples overwrite already-sensible defaults. Instead
   this fits a small CORRECTION to the current defaults, penalized toward
   zero -- ``--regularization`` controls how big a nudge a few examples
   are allowed to make; higher keeps closer to the defaults.

Preferences file: one ``source_doc_id, candidate_id`` pair per line (blank
lines and ``#`` comments ignored). Multiple candidates for the same doc are
treated as jointly preferred over everything else in that doc's pool -- no
order is assumed between them.

Run it::

    uv run l2-fit-weights \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/facets.csv \\
        analysis/output/l2/l2_l1.json \\
        analysis/output/l2/weight_preferences.txt

No credentials needed -- pure computation over already-computed embeddings
and facets.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.optimize import minimize

from analysis.l2 import io
from analysis.l2.recommend_links import (
    DEFAULT_FACET_BASIS,
    DEFAULT_FACET_MATCH_THRESHOLD,
    DEFAULT_SCORE_WEIGHTS,
    DEFAULT_SIMILARITY_METRIC,
    DEFAULT_SOURCE,
    DEFAULT_TARGET_SOURCES,
    DOCUMENT_SIMILARITY_METRICS,
    FACET_BASES,
    SOURCE_AFFINITY_SCORE,
    build_doc_canonical_profiles,
    canonical_overlap,
    facet_basis_column,
    source_affinity,
)
from analysis.l2.signatures import l2_normalize, stack_embeddings
from analysis.l2.use_cases import (
    build_doc_facet_index,
    facet_greedy_overlap,
    facet_max_similarities,
)

# combined_score weight keys this tool can fit from a document-only
# preference list -- is_document is deliberately excluded, see module
# docstring.
FITTED_KEYS: tuple[str, ...] = (
    "n_shared_canonical_facets",
    "source_affinity",
    "embedding_similarity",
)
DEFAULT_LOSER_POOL_SIZE = 30
DEFAULT_REGULARIZATION = 8.0


def parse_preferences(path: Path) -> list[tuple[str, str]]:
    """Read ``source_doc_id, candidate_id`` lines; blank/``#`` lines ignored."""
    pairs = []
    for lineno, raw in enumerate(path.read_text().splitlines(), start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) != 2 or not all(parts):
            raise SystemExit(
                f"{path}:{lineno}: expected 'doc_id, candidate_id', got {raw!r}"
            )
        pairs.append((parts[0], parts[1]))
    return pairs


def doc_candidate_features(
    doc_id: str,
    doc_matrix: np.ndarray,
    doc_ids: list[str],
    doc_index: dict[str, int],
    is_candidate: np.ndarray,
    doc_profiles: dict[str, dict[str, int]],
    doc_to_l2: dict[str, str],
    own_l2: str,
    own_l1: str,
    l2_to_l1: dict[str, str],
    *,
    similarity_metric: str,
    facet_basis: str,
    doc_facet_index: dict | None,
    facet_match_threshold: float,
) -> pd.DataFrame:
    """Every candidate-source document's raw ``combined_score`` inputs
    against ``doc_id`` -- unfiltered by any similarity floor, unlike
    :func:`analysis.l2.recommend_links.rank_document_candidates`, since a
    labeled preference might be a document the current floor would
    exclude. Indexed by ``candidate_id``.
    """
    if similarity_metric == "facet":
        sims = facet_max_similarities(doc_id, doc_ids, doc_facet_index)
    else:
        sims = doc_matrix @ doc_matrix[doc_index[doc_id]]
    own_profile = doc_profiles.get(doc_id, {})

    rows = []
    for j, target_id in enumerate(doc_ids):
        if target_id == doc_id or not is_candidate[j]:
            continue
        if facet_basis == "embedding":
            n_shared, _ = facet_greedy_overlap(
                doc_id, target_id, doc_facet_index, threshold=facet_match_threshold
            )
        else:
            n_shared, _ = canonical_overlap(
                own_profile, doc_profiles.get(target_id, {})
            )
        candidate_l2 = doc_to_l2.get(target_id, "")
        rows.append(
            {
                "candidate_id": target_id,
                "n_shared_canonical_facets": n_shared,
                "source_affinity": source_affinity(
                    candidate_l2, own_l2, own_l1, l2_to_l1
                ),
                "embedding_similarity": float(sims[j]),
            }
        )
    return pd.DataFrame(rows).set_index("candidate_id")


def _to_vector(row: pd.Series) -> np.ndarray:
    return np.array(
        [
            row["n_shared_canonical_facets"],
            SOURCE_AFFINITY_SCORE[row["source_affinity"]],
            row["embedding_similarity"],
        ],
        dtype=float,
    )


def build_training_pairs(
    preferences: list[tuple[str, str]],
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    l2_to_l1: dict[str, str],
    *,
    source: str,
    target_sources: tuple[str, ...],
    similarity_metric: str,
    facet_basis: str,
    facet_match_threshold: float,
    loser_pool_size: int,
    doc_id_col: str = "id",
    l2_col: str = "l2",
    source_col: str = "source",
    embedding_col: str = "embedding",
) -> np.ndarray:
    """``winner_features - loser_features`` rows, one per (labeled document,
    other document candidate) pair -- the training data for
    :func:`fit_weight_deltas`.
    """
    doc_to_l2 = docs_df.set_index(doc_id_col)[l2_col].to_dict()
    canonical_col = facet_basis_column(facet_basis)
    doc_profiles = build_doc_canonical_profiles(facets_df, canonical_col=canonical_col)

    doc_facet_index = None
    if similarity_metric == "facet" or facet_basis == "embedding":
        doc_facet_index = build_doc_facet_index(facets_df)

    relevant = docs_df[docs_df[source_col].isin((source, *target_sources))]
    doc_ids = relevant[doc_id_col].tolist()
    doc_index = {d: i for i, d in enumerate(doc_ids)}
    doc_matrix = l2_normalize(stack_embeddings(relevant[embedding_col]))
    is_candidate = relevant[source_col].isin(target_sources).to_numpy()

    preferences_by_doc: dict[str, list[str]] = {}
    for doc_id, candidate_id in preferences:
        preferences_by_doc.setdefault(doc_id, []).append(candidate_id)

    diffs = []
    for doc_id, winners in preferences_by_doc.items():
        if doc_id not in doc_index:
            print(
                f"⚠ {doc_id!r} isn't in --source/--target-source -- skipping",
                flush=True,
            )
            continue
        own_l2 = doc_to_l2.get(doc_id, "")
        own_l1 = l2_to_l1.get(own_l2, "")
        features = doc_candidate_features(
            doc_id,
            doc_matrix,
            doc_ids,
            doc_index,
            is_candidate,
            doc_profiles,
            doc_to_l2,
            own_l2,
            own_l1,
            l2_to_l1,
            similarity_metric=similarity_metric,
            facet_basis=facet_basis,
            doc_facet_index=doc_facet_index,
            facet_match_threshold=facet_match_threshold,
        )
        losers = features.drop(
            index=[w for w in winners if w in features.index], errors="ignore"
        )
        losers = losers.sort_values("embedding_similarity", ascending=False).head(
            loser_pool_size
        )
        for winner_id in winners:
            if winner_id not in features.index:
                print(
                    f"⚠ {winner_id!r} isn't a document candidate for {doc_id!r} "
                    "(wrong source, or not in --target-source) -- skipping",
                    flush=True,
                )
                continue
            winner_vec = _to_vector(features.loc[winner_id])
            for _, loser_row in losers.iterrows():
                diffs.append(winner_vec - _to_vector(loser_row))

    if not diffs:
        raise SystemExit("no usable training pairs -- check the preferences file")
    return np.array(diffs)


def fit_weight_deltas(
    diffs: np.ndarray, w_default: np.ndarray, *, regularization: float
) -> np.ndarray:
    """A small correction to ``w_default`` via L2-penalized pairwise
    logistic regression: minimize ``sum(-log(sigmoid((w_default + delta) @
    diff))) + regularization * ||delta||^2`` over ``delta``. Anchoring to
    ``w_default`` (rather than plain logistic regression's zero-weight
    prior) means a handful of examples only nudges already-sensible
    defaults instead of replacing them outright.
    """

    def neg_log_likelihood(delta: np.ndarray) -> float:
        z = diffs @ (w_default + delta)
        return float(
            np.sum(np.logaddexp(0.0, -z)) + regularization * np.sum(delta**2)
        )

    result = minimize(
        neg_log_likelihood, x0=np.zeros_like(w_default), method="L-BFGS-B"
    )
    return result.x


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument(
        "facets", type=Path, help="path to facets.csv (must have canonical_facet)"
    )
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument(
        "preferences",
        type=Path,
        help="path to a 'doc_id, candidate_id' per line preferences file",
    )
    parser.add_argument("--source", default=DEFAULT_SOURCE)
    parser.add_argument(
        "--target-source", action="append", dest="target_sources", default=None
    )
    parser.add_argument(
        "--similarity-metric",
        choices=DOCUMENT_SIMILARITY_METRICS,
        default=DEFAULT_SIMILARITY_METRIC,
    )
    parser.add_argument(
        "--facet-basis", choices=FACET_BASES, default=DEFAULT_FACET_BASIS
    )
    parser.add_argument(
        "--facet-match-threshold", type=float, default=DEFAULT_FACET_MATCH_THRESHOLD
    )
    parser.add_argument(
        "--loser-pool-size",
        type=int,
        default=DEFAULT_LOSER_POOL_SIZE,
        help="how many other document candidates per labeled doc to contrast "
        f"against, closest first by similarity (default: {DEFAULT_LOSER_POOL_SIZE})",
    )
    parser.add_argument(
        "--regularization",
        type=float,
        default=DEFAULT_REGULARIZATION,
        help="L2 penalty on the weight correction -- higher keeps closer to "
        "the current defaults, appropriate for few examples "
        f"(default: {DEFAULT_REGULARIZATION})",
    )
    args = parser.parse_args(argv)
    args.target_sources = (
        tuple(args.target_sources) if args.target_sources else DEFAULT_TARGET_SOURCES
    )
    return args


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    preferences = parse_preferences(args.preferences)
    n_docs = len({doc_id for doc_id, _ in preferences})
    print(f"⏳ {len(preferences)} preferences across {n_docs} documents", flush=True)

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)

    diffs = build_training_pairs(
        preferences,
        docs_df,
        facets_df,
        l2_to_l1,
        source=args.source,
        target_sources=args.target_sources,
        similarity_metric=args.similarity_metric,
        facet_basis=args.facet_basis,
        facet_match_threshold=args.facet_match_threshold,
        loser_pool_size=args.loser_pool_size,
    )
    print(f"✓ {len(diffs)} training pairs", flush=True)

    w_default = np.array([DEFAULT_SCORE_WEIGHTS[k] for k in FITTED_KEYS])
    delta = fit_weight_deltas(diffs, w_default, regularization=args.regularization)
    w_fitted = w_default + delta

    print(f"\n{'weight':>28}   {'default':>8}   {'fitted':>8}   {'delta':>8}")
    for key, d, f in zip(FITTED_KEYS, w_default, w_fitted, strict=True):
        print(f"{key:>28}   {d:8.4f}   {f:8.4f}   {f - d:+8.4f}")
    frozen = DEFAULT_SCORE_WEIGHTS["is_document"]
    print(f"{'is_document (frozen)':>28}   {frozen:8.4f}   {frozen:8.4f}   {'--':>8}")

    default_acc = float(np.mean(diffs @ w_default > 0))
    fitted_acc = float(np.mean(diffs @ w_fitted > 0))
    print(
        f"\npairs where the desired candidate already outscores the other: "
        f"{default_acc:.1%} (current defaults) -> {fitted_acc:.1%} (fitted)"
    )


if __name__ == "__main__":
    main()
