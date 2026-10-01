"""L2 pipeline, weight-fitting: derive training preferences from co-click
behavior instead of hand-labeling, then validate the fit against the small
hand-labeled set (:mod:`analysis.l2.fit_weights`'s ``weight_preferences.txt``)
kept as a held-out check rather than folded into training.

Why: ``l2-fit-weights`` only had 9 hand-labeled preferences to fit from,
which forces heavy regularization to avoid overfitting (see that module's
docstring). Session co-click is a much larger supervision source -- but raw
co-click is dominated by base-rate popularity, not relatedness: corpus-wide,
the median lift (observed co-click vs. what independence would predict) for
a candidate pair sits *below* 1 -- most co-occurrence is noise. Only the
upper tail is real signal, so pairs are filtered on both ``--min-lift`` (well
above chance) and ``--min-count`` (enough sessions behind the estimate that
the lift number itself isn't noise) before being used as preferences.

Co-click is also a genuinely different, weaker kind of evidence than a human
editor's deliberate judgment -- e.g. two documents can be co-clicked because
users compare them, not because they're complementary. That's exactly why
this fits on co-click-derived pairs but reports accuracy separately on the
hand-labeled set: a fit that quietly contradicts deliberate editorial
judgment is a red flag, not a footnote.

Run it::

    uv run l2-fit-weights-coclick \\
        analysis/output/l2/docs_openapi.csv \\
        analysis/output/l2/facets.csv \\
        analysis/output/l2/l2_l1.json \\
        analysis/output/l2/sessions.parquet \\
        analysis/output/l2/weight_preferences.txt

No credentials needed -- pure computation over already-computed embeddings/
facets/sessions.
"""

from __future__ import annotations

import argparse
from ast import literal_eval
from collections import Counter
from itertools import combinations
from pathlib import Path

import numpy as np
import pandas as pd

from analysis.l2 import io
from analysis.l2.fit_weights import (
    DEFAULT_LOSER_POOL_SIZE,
    FITTED_KEYS,
    build_training_pairs,
    fit_weight_deltas,
    parse_preferences,
)
from analysis.l2.recommend_links import (
    DEFAULT_FACET_BASIS,
    DEFAULT_FACET_MATCH_THRESHOLD,
    DEFAULT_SCORE_WEIGHTS,
    DEFAULT_SIMILARITY_METRIC,
    DEFAULT_SOURCE,
    DEFAULT_TARGET_SOURCES,
    DOCUMENT_SIMILARITY_METRICS,
    FACET_BASES,
)

# Below this, a session's own click count says more about crawler/outlier
# behavior than genuine multi-page engagement -- capped, not dropped
# entirely, so it still counts toward marginals up to the cap boundary.
DEFAULT_MAX_SESSION_SIZE = 20
DEFAULT_MIN_COUNT = 10
DEFAULT_MIN_LIFT = 5.0
# Much weaker than fit_weights.py's DEFAULT_REGULARIZATION=8.0 -- that value
# hedges against overfitting 9 examples; with hundreds/thousands of
# co-click-derived pairs the same overfitting risk mostly goes away.
DEFAULT_COCLICK_REGULARIZATION = 0.5


def load_sessions_any(path: Path) -> list[list[str]]:
    """``sessions.parquet`` (the real pipeline artifact) or an ad-hoc
    ``sessions.csv`` with a literal-list ``session`` column (e.g. exported
    from a notebook) -- either way, one list of doc ids per session.
    """
    if path.suffix == ".parquet":
        return io.load_sessions(path)
    sessions_df = pd.read_csv(path, usecols=["session"])
    return sessions_df["session"].apply(literal_eval).tolist()


def build_coclick_index(
    sessions: list[list[str]],
    relevant_ids: set[str],
    *,
    max_session_size: int = DEFAULT_MAX_SESSION_SIZE,
) -> tuple[Counter[tuple[str, str]], Counter[str], int]:
    """``(pair_counts, marginal, n_sessions_used)``, restricted to
    ``relevant_ids`` -- the only ids :func:`coclick_lift_table` can ever
    turn into a usable preference, so counting anything else just wastes
    time on a corpus of a few thousand documents times up to ~20 co-viewed
    docs per session.

    Oversized sessions (more than ``max_session_size`` distinct docs --
    crawler-like, not genuine multi-page engagement) are skipped entirely,
    including from the marginals, rather than truncated -- a truncated
    sample of an oversized session is an arbitrary subset, not a real one.
    """
    pair_counts: Counter[tuple[str, str]] = Counter()
    marginal: Counter[str] = Counter()
    n_sessions_used = 0
    for session in sessions:
        all_unique = set(session)
        if len(all_unique) > max_session_size:
            continue
        n_sessions_used += 1
        unique_docs = all_unique & relevant_ids
        for doc in unique_docs:
            marginal[doc] += 1
        for a, b in combinations(sorted(unique_docs), 2):
            pair_counts[(a, b)] += 1
    return pair_counts, marginal, n_sessions_used


def coclick_lift_table(
    pair_counts: Counter[tuple[str, str]],
    marginal: Counter[str],
    n_sessions: int,
    target_ids: set[str],
) -> pd.DataFrame:
    """Directed ``(doc_id, candidate_id, observed, lift)`` rows -- one row
    per side of a co-clicked pair that could be a valid preference (i.e.
    ``candidate_id`` is a document :func:`analysis.l2.fit_weights.build_training_pairs`
    would accept, meaning its source is in ``target_sources``).

    ``lift`` is observed co-click count over what independence would
    predict (``marginal(a) * marginal(b) / n_sessions``) -- corrects for
    the base-rate popularity bias raw co-click count has (a couple of
    generically high-traffic docs co-occur with almost everything).
    """
    rows = []
    for (a, b), observed in pair_counts.items():
        m_a, m_b = marginal.get(a, 0), marginal.get(b, 0)
        if m_a == 0 or m_b == 0:
            continue
        expected = (m_a * m_b) / n_sessions
        lift = observed / expected if expected > 0 else 0.0
        if b in target_ids:
            rows.append((a, b, observed, lift))
        if a in target_ids and a != b:
            rows.append((b, a, observed, lift))
    return pd.DataFrame(rows, columns=["doc_id", "candidate_id", "observed", "lift"])


def derive_preferences(
    lift_df: pd.DataFrame,
    *,
    min_count: int = DEFAULT_MIN_COUNT,
    min_lift: float = DEFAULT_MIN_LIFT,
) -> list[tuple[str, str]]:
    """``(doc_id, candidate_id)`` pairs clearing both thresholds -- see the
    module docstring for why both are needed (count alone is popularity-
    biased; lift alone can be a noisy ratio of small numbers)."""
    kept = lift_df[(lift_df["observed"] >= min_count) & (lift_df["lift"] >= min_lift)]
    return list(zip(kept["doc_id"], kept["candidate_id"], strict=True))


def _report_accuracy(
    label: str, diffs: np.ndarray, w_default: np.ndarray, w_fitted: np.ndarray
) -> None:
    default_acc = float(np.mean(diffs @ w_default > 0))
    fitted_acc = float(np.mean(diffs @ w_fitted > 0))
    print(
        f"{label}: {default_acc:.1%} (current defaults) -> {fitted_acc:.1%} (fitted)"
    )


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument(
        "facets", type=Path, help="path to facets.csv (must have canonical_facet)"
    )
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument(
        "sessions",
        type=Path,
        help="path to sessions.parquet, or an ad-hoc sessions.csv with a "
        "literal-list 'session' column",
    )
    parser.add_argument(
        "hand_labeled_preferences",
        type=Path,
        help="path to the small hand-labeled 'doc_id, candidate_id' file -- "
        "held out as a validation check, never trained on",
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
        "--loser-pool-size", type=int, default=DEFAULT_LOSER_POOL_SIZE
    )
    parser.add_argument("--min-count", type=int, default=DEFAULT_MIN_COUNT)
    parser.add_argument("--min-lift", type=float, default=DEFAULT_MIN_LIFT)
    parser.add_argument(
        "--max-session-size", type=int, default=DEFAULT_MAX_SESSION_SIZE
    )
    parser.add_argument(
        "--regularization", type=float, default=DEFAULT_COCLICK_REGULARIZATION
    )
    parser.add_argument(
        "--save-preferences",
        type=Path,
        default=None,
        help="also write the derived (doc_id, candidate_id) pairs to this "
        "path, in the same format as a hand-labeled preferences file",
    )
    args = parser.parse_args(argv)
    args.target_sources = (
        tuple(args.target_sources) if args.target_sources else DEFAULT_TARGET_SOURCES
    )
    return args


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)

    relevant_ids = set(
        docs_df.loc[docs_df["source"].isin((args.source, *args.target_sources)), "id"]
    )
    target_ids = set(
        docs_df.loc[docs_df["source"].isin(args.target_sources), "id"]
    )

    print("⏳ Loading sessions…", flush=True)
    sessions = load_sessions_any(args.sessions)
    print(f"✓ {len(sessions)} sessions", flush=True)

    pair_counts, marginal, n_sessions = build_coclick_index(
        sessions, relevant_ids, max_session_size=args.max_session_size
    )
    lift_df = coclick_lift_table(pair_counts, marginal, n_sessions, target_ids)
    coclick_preferences = derive_preferences(
        lift_df, min_count=args.min_count, min_lift=args.min_lift
    )
    print(
        f"✓ {len(coclick_preferences)} co-click-derived preferences "
        f"(min_count>={args.min_count}, min_lift>={args.min_lift})",
        flush=True,
    )
    if args.save_preferences:
        args.save_preferences.write_text(
            "\n".join(f"{d}, {c}" for d, c in coclick_preferences) + "\n"
        )
        print(f"✓ {args.save_preferences}")

    build_kwargs = dict(
        source=args.source,
        target_sources=args.target_sources,
        similarity_metric=args.similarity_metric,
        facet_basis=args.facet_basis,
        facet_match_threshold=args.facet_match_threshold,
        loser_pool_size=args.loser_pool_size,
    )
    diffs = build_training_pairs(
        coclick_preferences, docs_df, facets_df, l2_to_l1, **build_kwargs
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

    print()
    _report_accuracy(
        "co-click training set (what was fit on)", diffs, w_default, w_fitted
    )

    hand_preferences = parse_preferences(args.hand_labeled_preferences)
    hand_diffs = build_training_pairs(
        hand_preferences, docs_df, facets_df, l2_to_l1, **build_kwargs
    )
    _report_accuracy(
        "hand-labeled set (held out, NOT trained on)", hand_diffs, w_default, w_fitted
    )


if __name__ == "__main__":
    main()
