"""L2 audit: signatures + editorial use cases -> Excel review export.

Builds one signature per L2 (:mod:`analysis.l2.signatures.core`), then runs:

  1. misclassification (:mod:`analysis.l2.audit.misclassification`) --
     documents that may belong to a different L2;
  2. complementary L2s (:mod:`analysis.l2.audit.complementary`) -- which other
     L2 classes are worth cross-linking to, from facets + embeddings.

Output is a shortlist for an editor to check (``labelled_docs.xlsx``), not
something applied automatically. ``--sessions`` (co-click data) is optional and
only adds a corroboration column to use case 1. ``--embeddings-only`` skips
facets entirely (pure whole-document embedding similarity).

Question theming is its own step: ``l2 questions theme``.

Run it::

    uv run l2 audit \
        analysis/output/l2/docs.csv \
        analysis/output/l2/facets.csv \
        analysis/output/l2/l2_l1.json \
        --sessions analysis/output/l2/sessions.parquet

    # no facets, no sessions
    uv run l2 audit analysis/output/l2/docs.csv analysis/output/l2/l2_l1.json \
        --embeddings-only

No credentials needed -- pure computation over already-built artifacts.
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path

import pandas as pd

from analysis.l2 import io
from analysis.l2.audit.complementary import add_complementary_l2_columns_content_only
from analysis.l2.audit.misclassification import (
    add_misclassification_columns,
    check_session_doc_coverage,
    sessions_to_long_df,
)
from analysis.l2.config import COMPLEMENTARY_FACET_WEIGHT
from analysis.l2.signatures.core import build_l2_signatures

_EMPTY_FACETS_COLUMNS = ["doc_id", "text", "type", "salience", "embedding"]

_DOC_REVIEW_COLUMNS = [
    "id",
    "title",
    "slug",
    "source",
    "l2",
    "better_l2",
    "l2_scoring_details",
    "complementary_l2_1",
    "complementary_l2_2",
    "complementary_l2_1_bridge",
    "complementary_l2_2_bridge",
    "complementary_l2_source",
]


def run_audit(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    l2_to_l1: dict[str, str],
    sessions: list[list[str]] | None = None,
    *,
    facet_weight: float = COMPLEMENTARY_FACET_WEIGHT,
    doc_id_col: str = "id",
    l2_col: str = "l2",
) -> tuple[pd.DataFrame, dict]:
    """Build signatures, then run both audit use cases.

    Returns ``(docs_out, signatures)``.
    """
    doc_to_l2 = docs_df.set_index(doc_id_col)[l2_col].to_dict()
    sessions_long = sessions_to_long_df(sessions or [])
    if sessions:
        check_session_doc_coverage(sessions_long, doc_to_l2)

    print("⏳ Building L2 signatures…", flush=True)
    signatures = build_l2_signatures(
        docs_df, facets_df, l2_to_l1, doc_id_col=doc_id_col, l2_col=l2_col
    )
    print(f"✓ {len(signatures)} signatures", flush=True)

    docs_out = add_misclassification_columns(
        docs_df,
        signatures,
        sessions_long,
        doc_to_l2,
        doc_id_col=doc_id_col,
        l2_col=l2_col,
    )
    docs_out = add_complementary_l2_columns_content_only(
        docs_out,
        facets_df,
        signatures,
        doc_to_l2,
        doc_id_col=doc_id_col,
        facet_weight=facet_weight,
    )
    return docs_out, signatures


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument(
        "paths",
        type=Path,
        nargs="+",
        help="facets.csv l2_l1.json (or just l2_l1.json with --embeddings-only)",
    )
    parser.add_argument(
        "--embeddings-only",
        action="store_true",
        help="ignore facets: signatures and complementary ranking use "
        "whole-document embeddings only",
    )
    parser.add_argument(
        "--sessions", type=Path, default=None, help="path to sessions.parquet"
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[4] / "output" / "l2",
        help="output directory for labelled_docs.xlsx",
    )
    args = parser.parse_args(argv)
    expected = 1 if args.embeddings_only else 2
    if len(args.paths) != expected:
        parser.error(
            "expected l2_l1.json only with --embeddings-only"
            if args.embeddings_only
            else "expected facets.csv and l2_l1.json"
        )
    return args


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    docs_df = io.load_docs(args.docs)
    l2_to_l1 = io.load_l2_l1(args.paths[-1])
    if args.embeddings_only:
        facets_df = pd.DataFrame(columns=_EMPTY_FACETS_COLUMNS)
        facet_weight = 0.0
    else:
        facets_df = io.load_facets(args.paths[0])
        facet_weight = COMPLEMENTARY_FACET_WEIGHT
    sessions = io.load_sessions(args.sessions) if args.sessions else None

    t0 = time.time()
    docs_out, _ = run_audit(
        docs_df, facets_df, l2_to_l1, sessions, facet_weight=facet_weight
    )
    print(f"✓ Audit run in {time.time() - t0:.1f}s.")

    n_flagged = docs_out["better_l2"].notna().sum()
    print(f"\n{n_flagged}/{len(docs_out)} documents flagged with a possibly-better L2.")

    args.out.mkdir(parents=True, exist_ok=True)
    docs_path = args.out / "labelled_docs.xlsx"
    docs_out[_DOC_REVIEW_COLUMNS].to_excel(docs_path)
    print(f"✓ {docs_path}")


if __name__ == "__main__":
    main()
