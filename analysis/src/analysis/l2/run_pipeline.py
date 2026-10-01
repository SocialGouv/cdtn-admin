"""L2 pipeline, stage 5: signatures + the three use cases -> Excel review exports.

Loads every artifact produced by the earlier stages (:mod:`analysis.l2.build_docs`,
:mod:`analysis.l2.extract_facets`, :mod:`analysis.l2.build_sessions`,
:mod:`analysis.l2.embed_questions`), builds one signature per L2
(:mod:`analysis.l2.signatures`), then runs the three editorial use cases
(:mod:`analysis.l2.use_cases`) and writes the results to Excel for human
review — this pipeline's output is a shortlist for an editor to check, not
something applied automatically.

Sessions and questions are optional: without ``--sessions``, complementary-L2
ranking falls back to the content-only method (facets + embeddings, no
co-click data) automatically; without ``--questions``, use case 3 is skipped.

Run it::

    uv run python -m analysis.l2.run_pipeline \
        analysis/output/l2/docs.csv \
        analysis/output/l2/facets.csv \
        analysis/output/l2/l2_l1.json \
        --sessions analysis/output/l2/sessions.parquet \
        --questions analysis/output/l2/questions.parquet

No credentials needed — this stage is pure computation over the artifacts
already pulled by the earlier stages.
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path

import pandas as pd

from analysis.l2 import io
from analysis.l2.signatures import build_l2_signatures
from analysis.l2.use_cases import (
    add_complementary_l2_columns,
    add_complementary_l2_columns_content_only,
    add_misclassification_columns,
    add_question_l2_columns,
    build_l2_coclick_matrix,
    check_session_doc_coverage,
    sessions_to_long_df,
)

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
_QUESTION_REVIEW_COLUMNS = ["id", "text", "matched_l2_1", "matched_l2_2"]


def run_pipeline(
    docs_df: pd.DataFrame,
    facets_df: pd.DataFrame,
    l2_to_l1: dict[str, str],
    sessions: list[list[str]] | None = None,
    questions_df: pd.DataFrame | None = None,
    *,
    complementary_method: str = "content-only",
    doc_id_col: str = "id",
    l2_col: str = "l2",
) -> tuple[pd.DataFrame, pd.DataFrame | None, dict]:
    """Build signatures, then run all three use cases.

    Returns ``(docs_out, questions_out, signatures)`` -- ``questions_out`` is
    ``None`` when ``questions_df`` isn't provided.
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

    if complementary_method == "co-click":
        if not sessions:
            raise ValueError("--complementary-method co-click needs --sessions")
        _, l2_coclick_lift, _ = build_l2_coclick_matrix(sessions_long, doc_to_l2)
        docs_out = add_complementary_l2_columns(
            docs_out,
            facets_df,
            signatures,
            sessions_long,
            doc_to_l2,
            l2_coclick_lift,
            doc_id_col=doc_id_col,
        )
    else:
        docs_out = add_complementary_l2_columns_content_only(
            docs_out, facets_df, signatures, doc_to_l2, doc_id_col=doc_id_col
        )

    questions_out = (
        add_question_l2_columns(questions_df, signatures)
        if questions_df is not None
        else None
    )
    return docs_out, questions_out, signatures


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument("facets", type=Path, help="path to facets.csv")
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument(
        "--sessions", type=Path, default=None, help="path to sessions.parquet"
    )
    parser.add_argument(
        "--questions", type=Path, default=None, help="path to questions.parquet"
    )
    parser.add_argument(
        "--complementary-method",
        choices=("content-only", "co-click"),
        default="content-only",
        help="use case 2 ranking method (default: content-only, needs no session data)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[3] / "output" / "l2",
        help="output directory for the review .xlsx files",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    docs_df = io.load_docs(args.docs)
    facets_df = io.load_facets(args.facets)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)
    sessions = io.load_sessions(args.sessions) if args.sessions else None
    questions_df = io.load_questions(args.questions) if args.questions else None

    t0 = time.time()
    docs_out, questions_out, signatures = run_pipeline(
        docs_df,
        facets_df,
        l2_to_l1,
        sessions,
        questions_df,
        complementary_method=args.complementary_method,
    )
    print(f"✓ Pipeline run in {time.time() - t0:.1f}s.")

    n_flagged = docs_out["better_l2"].notna().sum()
    print(f"\n{n_flagged}/{len(docs_out)} documents flagged with a possibly-better L2.")

    args.out.mkdir(parents=True, exist_ok=True)
    docs_path = args.out / "labelled_docs.xlsx"
    docs_out[_DOC_REVIEW_COLUMNS].to_excel(docs_path)
    print(f"✓ {docs_path}")

    if questions_out is not None:
        questions_path = args.out / "labelled_questions.xlsx"
        questions_out[_QUESTION_REVIEW_COLUMNS].to_excel(questions_path)
        print(f"✓ {questions_path}")


if __name__ == "__main__":
    main()
