"""L2 pipeline, stage 3: Matomo visit logs -> co-click sessions.

Pulls raw visit-action rows from the Matomo PostgreSQL replica over a date
range, reshapes them into one row per visit (which content types were
touched, collective-agreement clicks, etc.), keeps visits that show genuine
multi-page engagement, and maps each visit's URLs to document ids — producing
the co-click "sessions" (lists of document ids viewed together) that
:mod:`analysis.l2.use_cases` uses as behavioral evidence.

**This is a heavy query**: 10 months of raw action rows on
code.travail.gouv.fr is tens of millions of rows. Pulled one calendar month at
a time to keep individual queries a reasonable size, not to shrink the total.

Output: ``visits.parquet`` (one row per qualifying visit, content-type counts +
CC-click diagnostics — useful on its own for visit-shape analysis) and
``sessions.parquet`` (the co-click lists consumed by stage 5).

Run it::

    uv run python -m analysis.l2.build_sessions analysis/output/l2/docs.csv
    uv run python -m analysis.l2.build_sessions analysis/output/l2/docs.csv \
        --months 3

Needs ``PG_MATOMO_*`` settings in ``.env``.
"""

from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path

import pandas as pd

from analysis.connectors.matomo import MatomoSQLConnectorSync
from analysis.l2 import io

_BASE_URL = "https://code.travail.gouv.fr/"

# Path segments worth keeping. content-type/content-slug pairs are the raw
# material for the doc-id lookup in map_visits_to_doc_sessions; "themes" and
# "code-du-travail" carry no matching document (docs_df has no such source)
# but are kept so a visit's *shape* (n_contents, contents) still reflects
# them, even though they never resolve to a doc id.
CONTENT_TYPES: tuple[str, ...] = (
    "fiche-ministere-travail",
    "fiche-service-public",
    "outils",
    "contribution",
    "themes",
    "modeles-de-courriers",
    "code-du-travail",
    "infographie",
    "actualite",
)

# ES `source` value for each URL content-type, where they differ.
SOURCE_RENAME: dict[str, str] = {
    "modeles-de-courriers": "modeles_de_courriers",
    "infographie": "infographies",
    "contribution": "contributions",
    "fiche-service-public": "fiches_service_public",
    "fiche-ministere-travail": "fiches_ministere_travail",
}

_ACTION_COLUMNS = ("action_id", "idvisit", "actions", "action_url")

_URL_PATTERN = r"^https://code\.travail\.gouv\.fr/(" + "|".join(CONTENT_TYPES) + ")/"

_VISIT_ACTIONS_QUERY = f"""
    SELECT {", ".join(_ACTION_COLUMNS)}
    FROM matomo_partitioned
    WHERE action_timestamp >= %s
      AND action_timestamp < %s
      AND action_type = 'action'
      AND action_url ~ %s
    ORDER BY action_timestamp ASC
"""


def _add_months(moment: datetime, months: int) -> datetime:
    total = moment.month - 1 + months
    return moment.replace(year=moment.year + total // 12, month=total % 12 + 1, day=1)


def month_ranges(
    n_months: int, *, end: datetime | None = None
) -> list[tuple[datetime, datetime]]:
    """The ``n_months`` full calendar months ending right before ``end``.

    ``end`` defaults to now.
    """
    current_month_start = (end or datetime.now()).replace(
        day=1, hour=0, minute=0, second=0, microsecond=0
    )
    return [
        (_add_months(current_month_start, -i), _add_months(current_month_start, -i + 1))
        for i in range(n_months, 0, -1)
    ]


def fetch_visit_actions(
    matomo: MatomoSQLConnectorSync, start: datetime, stop: datetime
) -> pd.DataFrame:
    """One month's qualifying visit-action rows."""
    return matomo.run_query_df(_VISIT_ACTIONS_QUERY, (start, stop, _URL_PATTERN))


def fetch_visit_actions_range(
    matomo: MatomoSQLConnectorSync, ranges: list[tuple[datetime, datetime]]
) -> pd.DataFrame:
    frames = []
    for start, stop in ranges:
        print(f"⏳ Matomo: {start:%Y-%m-%d} → {stop:%Y-%m-%d}…", flush=True)
        frame = fetch_visit_actions(matomo, start, stop)
        print(f"  {len(frame)} rows", flush=True)
        frames.append(frame)
    return pd.concat(frames, ignore_index=True)


def classify_urls(urls: pd.Series) -> tuple[pd.Series, pd.Series]:
    """``action_url`` -> ``(content_type, content_slug)``, both possibly NaN."""
    rest = urls.str[len(_BASE_URL) :]
    content_type = rest.str.split("/").str[0]
    content_slug = (
        rest.str.split("/").str[1].str.split("?").str[0].str.split("#").str[0]
    )
    return content_type, content_slug


def build_visit_features(
    visits_df: pd.DataFrame, *, min_contents: int = 3
) -> pd.DataFrame:
    """One row per visit: content-type hit counts, contents list, CC-click stats.

    Only visits touching more than ``min_contents - 1`` qualifying pages are
    kept — a noise filter against bounce-y, single-page visits that carry no
    useful co-click signal.
    """
    content_type, content_slug = classify_urls(visits_df["action_url"])
    structured = pd.DataFrame(
        {"idvisit": visits_df["idvisit"], "type": content_type, "slug": content_slug}
    )
    structured = structured[structured["type"].isin(CONTENT_TYPES)]

    engaged = structured.groupby("idvisit")["idvisit"].transform("size") >= min_contents
    df = structured[engaged].dropna(subset=["type", "slug"])
    df = df.drop_duplicates(subset=["idvisit", "type", "slug"]).copy()
    df["content"] = df["type"] + "/" + df["slug"]

    g = df.groupby("idvisit")
    result = g["type"].value_counts().unstack(fill_value=0)
    result["n_contents"] = g.size()
    result["contents"] = g["content"].apply(list)

    contribs = df.loc[df["type"] == "contribution", ["idvisit", "slug"]].copy()
    contribs["idcc_digits"] = contribs["slug"].str.split("-").str[0]
    contribs["is_cc"] = contribs["idcc_digits"].str.isdigit()
    cg = contribs.groupby("idvisit")

    result["has_contribs"] = result.index.isin(contribs["idvisit"].unique())
    result["contribs_cc"] = (
        cg["is_cc"].sum().reindex(result.index).fillna(0).astype(int)
    )
    idcc = cg.apply(
        lambda sub: sub.loc[sub["is_cc"], "idcc_digits"].unique().tolist() or None,
        include_groups=False,
    )
    result["idcc"] = idcc.reindex(result.index)
    result["n_idcc"] = result["idcc"].apply(
        lambda x: len(x) if isinstance(x, list) else None
    )

    return result.reset_index().rename_axis(None, axis=1)


def _docs_index(docs_df: pd.DataFrame) -> dict[tuple[str, str], list[str]]:
    """``(source, slug) -> [doc_id, ...]`` lookup, built once for O(1) mapping."""
    index: dict[tuple[str, str], list[str]] = {}
    for doc_id, source, slug in zip(
        docs_df["id"], docs_df["source"], docs_df["slug"], strict=True
    ):
        index.setdefault((source, slug), []).append(doc_id)
    return index


def map_visits_to_doc_sessions(
    analyzed_visits_df: pd.DataFrame, docs_df: pd.DataFrame
) -> list[list[str]]:
    """Map each visit's ``contents`` ("type/slug" strings) to doc ids.

    **Known limitation**: personalized contribution URLs
    (``/contribution/{idcc}-{slug}``, the flat scheme) do not resolve to a
    doc id -- ``classify_urls`` takes the raw second path segment as the
    slug (``"{idcc}-{slug}"``), which never matches ``docs_df``'s generic
    ``slug``. Only the generic ``/contribution/{slug}`` form contributes to
    sessions today; a visit that only touched personalized contribution
    pages contributes no doc ids for them (see ``contrib_monthly_views.py``
    for the same slug-scheme distinction handled properly, for a template if
    this needs fixing here too).
    """
    docs_index = _docs_index(docs_df)

    def contents_to_doc_ids(contents: list[str]) -> list[str]:
        ids: set[str] = set()
        for content in contents:
            content_type, slug = content.split("/", 1)
            source = SOURCE_RENAME.get(content_type, content_type)
            ids.update(docs_index.get((source, slug), ()))
        return list(ids)

    return [contents_to_doc_ids(c) for c in analyzed_visits_df["contents"]]


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "docs", type=Path, help="path to docs.csv (analysis.l2.build_docs output)"
    )
    parser.add_argument(
        "--months",
        type=int,
        default=10,
        help="number of full calendar months to pull (default: 10)",
    )
    parser.add_argument(
        "--min-contents",
        type=int,
        default=3,
        help="drop visits touching fewer qualifying pages than this (default: 3)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="output directory for visits.parquet/sessions.parquet "
        "(default: alongside docs.csv)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = _parse_args(argv)
    out_dir = args.out or args.docs.parent

    docs_df = io.load_docs(args.docs)
    ranges = month_ranges(args.months)

    with MatomoSQLConnectorSync() as matomo:
        raw_actions = fetch_visit_actions_range(matomo, ranges)
    print(f"✓ {len(raw_actions)} raw action rows", flush=True)

    visits_df = build_visit_features(raw_actions, min_contents=args.min_contents)
    print(f"✓ {len(visits_df)} qualifying visits", flush=True)

    sessions = map_visits_to_doc_sessions(visits_df, docs_df)

    out_dir.mkdir(parents=True, exist_ok=True)
    visits_path = out_dir / "visits.parquet"
    sessions_path = out_dir / "sessions.parquet"
    visits_df.to_parquet(visits_path, index=False)
    io.save_sessions(sessions, sessions_path)
    print(f"\n✓ {visits_path}\n✓ {sessions_path}")


if __name__ == "__main__":
    main()
