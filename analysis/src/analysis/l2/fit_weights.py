"""L2 pipeline, tuning tool: fit combined_score's weights from a small list
of human good/bad votes on suggested links.

For each source document you provide, gathers every OTHER document
candidate from the target sources (unfiltered by ``--min-similarity`` --
a labeled preference might currently sit below that floor, which is
exactly the case a fit needs to see, not lose) and builds one training
pair per (your desired candidate, some other candidate): the desired one
should score higher. Those pairs feed a small, regularized fit that
corrects :data:`analysis.l2.recommend_links.DEFAULT_SCORE_WEIGHTS`.

Training data is the tagging UI's ``votes/link_tags.csv`` (see
``tools/README.md``). ``good`` document votes are the desired candidates;
``bad`` document votes are explicit losers, always contrasted against the
winners on top of the usual pool of most-similar other documents -- they
are exactly the candidates the current score wrongly surfaced. Cancelled
(empty) votes and L2 candidates are ignored.

Two things this tool deliberately does NOT do:

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

Fitted weights are rescaled by default to the same total as the defaults
(``--no-normalize`` to disable): the fit mostly inflates the overall scale,
which doesn't change document-vs-document ranking but would shrink the
frozen ``is_document`` weight's relative importance.

Multiple good candidates for the same doc are treated as jointly preferred
over everything else in that doc's pool -- no order is assumed between them.

Run it::

    uv run l2-fit-weights \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/facets.csv \\
        analysis/output/l2/l2_l1.json \\
        analysis/tools/votes/link_tags.csv

No credentials needed -- pure computation over already-computed embeddings
and facets.
"""

from __future__ import annotations

import argparse
import csv
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


def load_votes(path: Path) -> tuple[list[tuple[str, str]], list[tuple[str, str]]]:
    """``(good, bad)`` lists of ``(source_doc_id, candidate_id)`` from a
    ``link_tags.csv``. Only document candidates with a non-empty vote count.
    """
    good: list[tuple[str, str]] = []
    bad: list[tuple[str, str]] = []
    with path.open(encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            if row["candidate_type"] != "document":
                continue
            pair = (row["source_doc_id"], row["candidate_id"])
            if row["vote"] == "good":
                good.append(pair)
            elif row["vote"] == "bad":
                bad.append(pair)
    return good, bad


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
    bad_preferences: list[tuple[str, str]] = (),
    features_out: dict[str, pd.DataFrame] | None = None,
    doc_id_col: str = "id",
    l2_col: str = "l2",
    source_col: str = "source",
    embedding_col: str = "embedding",
) -> np.ndarray:
    """``winner_features - loser_features`` rows, one per (labeled document,
    other document candidate) pair -- the training data for
    :func:`fit_weight_deltas`. ``bad_preferences`` (``(doc_id, candidate_id)``)
    are added to each doc's losers on top of the ``loser_pool_size`` closest.
    If ``features_out`` is given, it is filled with each labeled doc's full
    candidate feature table (for :func:`ranking_report`).
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

    bad_by_doc: dict[str, list[str]] = {}
    for doc_id, candidate_id in bad_preferences:
        bad_by_doc.setdefault(doc_id, []).append(candidate_id)

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
        if features_out is not None:
            features_out[doc_id] = features
        losers = features.drop(
            index=[w for w in winners if w in features.index], errors="ignore"
        )
        losers = losers.sort_values("embedding_similarity", ascending=False).head(
            loser_pool_size
        )
        explicit_bad = [
            b
            for b in bad_by_doc.get(doc_id, [])
            if b in features.index and b not in winners and b not in losers.index
        ]
        if explicit_bad:
            losers = pd.concat([losers, features.loc[explicit_bad]])
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


DEFAULT_TOP_K = 3


def ranking_report(
    features_by_doc: dict[str, pd.DataFrame],
    good: list[tuple[str, str]],
    bad: list[tuple[str, str]],
    w: np.ndarray,
    *,
    top_k: int = DEFAULT_TOP_K,
) -> dict[str, float]:
    """Rank-aware metrics over the FULL document candidate list (not the
    sampled loser pool). A good link ranked below ``top_k`` is a miss: only
    the ``top_k`` best are shown. Rank is 1 + the number of non-good
    candidates scoring strictly higher (other good links don't count against
    each other). ``bad_in_top_k`` counts bad-voted links that would be shown.
    """
    good_by_doc: dict[str, set[str]] = {}
    for d, c in good:
        good_by_doc.setdefault(d, set()).add(c)
    bad_by_doc: dict[str, set[str]] = {}
    for d, c in bad:
        bad_by_doc.setdefault(d, set()).add(c)

    ranks: list[int] = []
    bad_in_top = bad_total = 0
    for doc_id, features in features_by_doc.items():
        scores = pd.Series(
            np.array([_to_vector(r) for _, r in features.iterrows()]) @ w,
            index=features.index,
        )
        winners = good_by_doc.get(doc_id, set()) & set(scores.index)
        others = scores.drop(index=list(winners))
        for winner in winners:
            ranks.append(1 + int((others > scores[winner]).sum()))
        shown = set(scores.sort_values(ascending=False).head(top_k).index)
        doc_bad = bad_by_doc.get(doc_id, set()) & set(scores.index)
        bad_total += len(doc_bad)
        bad_in_top += len(doc_bad & shown)
    r = np.array(ranks)
    return {
        f"hit@{top_k}": float(np.mean(r <= top_k)),
        "mrr": float(np.mean(1.0 / r)),
        "median_rank": float(np.median(r)),
        "n_good": len(r),
        f"bad_in_top{top_k}": bad_in_top,
        "n_bad": bad_total,
    }


def _print_ranking(label: str, report: dict[str, float], top_k: int) -> None:
    print(
        f"{label:>10}: hit@{top_k} {report[f'hit@{top_k}']:.1%}  "
        f"MRR {report['mrr']:.3f}  median rank {report['median_rank']:.0f}  "
        f"bad links shown {report[f'bad_in_top{top_k}']}/{report['n_bad']}"
    )


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
        help="path to the tagging UI's link_tags.csv (good/bad votes)",
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
    parser.add_argument(
        "--top-k",
        type=int,
        default=DEFAULT_TOP_K,
        help="number of links actually shown; a good link ranked below it "
        f"counts as missed in the ranking report (default: {DEFAULT_TOP_K})",
    )
    parser.add_argument(
        "--no-normalize",
        dest="normalize",
        action="store_false",
        help="keep the raw fitted weights instead of rescaling them to the "
        "defaults' total (the fit tends to inflate the overall scale, which "
        "shifts the frozen is_document weight's relative importance)",
    )
    args = parser.parse_args(argv)
    args.target_sources = (
        tuple(args.target_sources) if args.target_sources else DEFAULT_TARGET_SOURCES
    )
    return args


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    preferences, bad_preferences = load_votes(args.preferences)
    n_docs = len({doc_id for doc_id, _ in preferences})
    print(
        f"⏳ {len(preferences)} good / {len(bad_preferences)} bad votes, "
        f"{n_docs} documents with a good link",
        flush=True,
    )

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)

    features_by_doc: dict[str, pd.DataFrame] = {}
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
        bad_preferences=bad_preferences,
        features_out=features_by_doc,
    )
    print(f"✓ {len(diffs)} training pairs", flush=True)

    w_default = np.array([DEFAULT_SCORE_WEIGHTS[k] for k in FITTED_KEYS])
    delta = fit_weight_deltas(diffs, w_default, regularization=args.regularization)
    w_fitted = w_default + delta
    if args.normalize:
        # Only the ratios between weights matter among documents, but the
        # frozen is_document weight is compared against them (document vs
        # L2 candidates): rescale to the defaults' total so it stays
        # comparable instead of drifting as the fit inflates the scale.
        w_fitted = w_fitted * (w_default.sum() / w_fitted.sum())

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

    print(
        f"\nranking over ALL document candidates (a good link below rank "
        f"{args.top_k} counts as missed):"
    )
    for label, w in (("defaults", w_default), ("fitted", w_fitted)):
        _print_ranking(
            label,
            ranking_report(
                features_by_doc, preferences, bad_preferences, w, top_k=args.top_k
            ),
            args.top_k,
        )


if __name__ == "__main__":
    main()
