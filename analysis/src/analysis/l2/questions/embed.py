"""L2 pipeline, stage 4 (optional): raw questions CSV -> embedded questions.

Feeds use case 3 (question -> L2 matching,
:func:`analysis.l2.facet_index.add_question_l2_columns`). Embeds a
manually-provided CSV of free-text questions (e.g. an export of
user-submitted questions) in the same embedding space as documents and facets.

The input CSV must have a ``Question`` column (text) and may have other
columns (e.g. ``Department``, to filter out internal/test submissions before
running stage 5 — see ``--exclude-department``); every other column is
dropped, since only the question text and its embedding matter downstream.

Output: ``questions.parquet`` (id, text, embedding).

Run it::

    uv run python -m analysis.l2.questions.embed questions_raw.csv
    uv run python -m analysis.l2.questions.embed questions_raw.csv --provider albert
    uv run python -m analysis.l2.questions.embed questions_raw.csv \
        --exclude-department "Fabrique Numérique" --exclude-department "Beta.gouv"

Needs ``OPENAI_*`` (default provider) or ``ALBERT_*`` settings in ``.env``,
matching ``--provider``. Use the same provider you embedded ``docs.csv``/
``facets.csv`` with -- :mod:`analysis.l2.signatures.core` computes cosine
similarity between questions and L2 signatures, which is only meaningful in
a shared embedding space.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from analysis.l2 import io
from analysis.l2.providers import DEFAULT_PROVIDER, PROVIDERS


def build_questions_df(
    questions_raw: pd.DataFrame,
    *,
    question_col: str = "Question",
    department_col: str = "Department",
    exclude_departments: tuple[str, ...] = (),
    provider: str = DEFAULT_PROVIDER,
) -> pd.DataFrame:
    """Embed a raw questions export.

    Rows in ``exclude_departments`` are dropped first.
    """
    if exclude_departments and department_col in questions_raw.columns:
        questions_raw = questions_raw[
            ~questions_raw[department_col].isin(exclude_departments)
        ]

    texts = questions_raw[question_col].reset_index(drop=True)
    embeddings = PROVIDERS[provider](texts.tolist())
    return pd.DataFrame(
        {
            "id": texts.index.astype(str),
            "text": texts.values,
            "embedding": embeddings.apply(list, axis=1).values,
        }
    )


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "questions_csv",
        type=Path,
        help="raw questions CSV, must have a Question column",
    )
    parser.add_argument("--question-col", default="Question")
    parser.add_argument("--department-col", default="Department")
    parser.add_argument(
        "--exclude-department",
        action="append",
        default=[],
        dest="exclude_departments",
        help="drop rows whose department-col matches this value (repeatable)",
    )
    parser.add_argument(
        "--provider",
        choices=sorted(PROVIDERS),
        default=DEFAULT_PROVIDER,
        help="embedding provider -- match whatever docs.csv/facets.csv used "
        "(default: openai)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output path for questions.parquet (default: alongside the input CSV)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    out_path = args.out or args.questions_csv.with_name("questions.parquet")

    questions_raw = pd.read_csv(args.questions_csv)
    print(f"• {len(questions_raw)} raw questions", flush=True)

    print(f"⏳ {args.provider}: embedding questions…", flush=True)
    questions_df = build_questions_df(
        questions_raw,
        question_col=args.question_col,
        department_col=args.department_col,
        exclude_departments=tuple(args.exclude_departments),
        provider=args.provider,
    )

    io.save_questions(questions_df, out_path)
    print(f"✓ {len(questions_df)} questions embedded")
    print(f"✓ {out_path}")


if __name__ == "__main__":
    main()
