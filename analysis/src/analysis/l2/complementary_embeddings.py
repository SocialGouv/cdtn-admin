"""L2 pipeline, extra stage: complementary-L2 suggestions from embeddings alone.

Runs :func:`analysis.l2.use_cases.add_complementary_l2_columns_content_only`
standalone, outside :mod:`analysis.l2.run_pipeline` -- for when you want use
case 2 (complementary L2 suggestions) with facets and sessions both out of
the picture: no ``facets.csv`` needed, no ``sessions.parquet`` needed.
Facets are optional here (``--facets``); when omitted, an empty facets table
is used and ``--facet-weight`` defaults to 0.0, so both the L2 signatures
themselves (:func:`analysis.l2.signatures.build_l2_signatures` has nothing
to blend in) and the complementary ranking reduce to pure whole-document
embedding similarity.

Passing ``--facets`` with a nonzero ``--facet-weight`` runs the exact same
use case as ``l2-run-pipeline --complementary-method content-only``, just
without the misclassification/question use cases alongside it.

Output: one row per document (id, title, slug, source, l2,
complementary_l2_1, complementary_l2_2, complementary_l2_1_score,
complementary_l2_2_score, complementary_l2_source) as ``.xlsx``, same
review-first convention as the rest of the pipeline.

Run it::

    uv run l2-complementary-embeddings \\
        analysis/output/l2/docs.csv \\
        analysis/output/l2/l2_l1.json

No credentials needed -- pure computation over ``docs.csv``/``l2_l1.json``.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd

from analysis.l2 import io
from analysis.l2.signatures import build_l2_signatures
from analysis.l2.use_cases import add_complementary_l2_columns_content_only

_EMPTY_FACETS_COLUMNS = ["doc_id", "text", "type", "salience", "embedding"]

_REVIEW_COLUMNS = [
    "id",
    "title",
    "slug",
    "source",
    "l2",
    "complementary_l2_1",
    "complementary_l2_2",
    "complementary_l2_1_score",
    "complementary_l2_2_score",
    "complementary_l2_source",
]


def _empty_facets_df() -> pd.DataFrame:
    return pd.DataFrame(columns=_EMPTY_FACETS_COLUMNS)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("docs", type=Path, help="path to docs.csv")
    parser.add_argument("l2_l1", type=Path, help="path to l2_l1.json")
    parser.add_argument(
        "--facets",
        type=Path,
        default=None,
        help="path to facets.csv (optional; omit for a pure-embeddings run)",
    )
    parser.add_argument(
        "--facet-weight",
        type=float,
        default=0.0,
        help="weight of facet-bridge evidence vs. embedding similarity "
        "(default: 0.0 -- pure embedding similarity; irrelevant without --facets)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[3] / "output" / "l2",
        help="output directory for the review .xlsx file",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)

    docs_df = io.load_docs(args.docs)
    l2_to_l1 = io.load_l2_l1(args.l2_l1)
    facets_df = io.load_facets(args.facets) if args.facets else _empty_facets_df()
    doc_to_l2 = docs_df.set_index("id")["l2"].to_dict()

    if args.facets is None:
        mode = "embeddings only"
    else:
        mode = f"facet_weight={args.facet_weight}"
    print(f"⏳ Building L2 signatures ({mode})…", flush=True)
    signatures = build_l2_signatures(docs_df, facets_df, l2_to_l1)
    print(f"✓ {len(signatures)} signatures", flush=True)

    docs_out = add_complementary_l2_columns_content_only(
        docs_df, facets_df, signatures, doc_to_l2, facet_weight=args.facet_weight
    )

    args.out.mkdir(parents=True, exist_ok=True)
    out_path = args.out / "complementary_l2_embeddings.xlsx"
    docs_out[_REVIEW_COLUMNS].to_excel(out_path, index=False)
    print(f"✓ {len(docs_out)} documents")
    print(f"✓ {out_path}")


if __name__ == "__main__":
    main()
