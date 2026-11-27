"""Schema consistency of the clarity widget ingesters (SQL strings only, no DB).

For each ingester, the ``CREATE TABLE`` columns, the ``INSERT`` column list,
the ``%s`` placeholders, the ``ON CONFLICT`` / ``DO UPDATE SET`` columns and the
tuples built by ``_rows_from_df`` must all agree.
"""

from __future__ import annotations

import re
from datetime import datetime
from types import ModuleType

import pandas as pd
import pytest

from analysis.commands import (
    ingest_notation_contributions,
    ingest_notation_contributions_pages,
    ingest_suggestions_contributions,
)
from analysis.reports.notation_contributions import aggregate_events
from analysis.reports.notation_contributions_pages import COUNT_COLUMNS
from analysis.reports.suggestions_contributions import extract_suggestions


def _names(column_list: str) -> list[str]:
    return [name.strip() for name in column_list.split(",") if name.strip()]


def create_table_columns(ddl: str) -> tuple[list[str], list[str]]:
    """(columns, primary key columns) of a ``CREATE TABLE`` statement."""
    body = re.search(r"\((.*)\)\s*;", ddl, re.S).group(1)
    primary_key = _names(re.search(r"PRIMARY KEY\s*\(([^)]*)\)", body).group(1))
    columns = [
        line.split()[0]
        for line in body.strip().splitlines()
        if line.strip() and not line.strip().startswith("PRIMARY KEY")
    ]
    return columns, primary_key


def insert_parts(sql: str) -> dict:
    """Column list, placeholder count, conflict and update columns of an INSERT."""
    columns = _names(re.search(r"INSERT INTO \w+\s*\(([^)]*)\)", sql, re.S).group(1))
    values = re.search(r"VALUES\s*\(([^)]*)\)", sql, re.S).group(1)
    conflict = _names(re.search(r"ON CONFLICT\s*\(([^)]*)\)", sql).group(1))
    update = re.search(r"DO UPDATE SET(.*?);", sql, re.S)
    return {
        "columns": columns,
        "placeholders": values.count("%s"),
        "non_placeholders": re.sub(r"%s|,|\s", "", values),
        "conflict": conflict,
        "update": (
            re.findall(r"(\w+)\s*=\s*EXCLUDED\.(\w+)", update.group(1))
            if update
            else None
        ),
        "do_nothing": bool(re.search(r"DO NOTHING\s*;", sql)),
    }


def _global_df() -> pd.DataFrame:
    return aggregate_events(pd.DataFrame())


def _pages_df() -> pd.DataFrame:
    return pd.DataFrame([{"page": "slug", **dict.fromkeys(COUNT_COLUMNS, 1)}])


def _suggestions_df() -> pd.DataFrame:
    return extract_suggestions(
        pd.DataFrame(
            [
                {
                    "action_timestamp": datetime(2026, 11, 1, 10, 30),
                    "operatingsystemname": "iOS",
                    "action_type": "event",
                    "action_url": "https://code.travail.gouv.fr/contribution/slug",
                    "action_eventcategory": "clarte_contribution_suggestion",
                    "action_eventaction": "Texte",
                    "action_eventname": "contribution/slug",
                }
            ]
        )
    )


CASES = [
    pytest.param(ingest_notation_contributions, "_UPSERT", _global_df, id="global"),
    pytest.param(ingest_notation_contributions_pages, "_UPSERT", _pages_df, id="pages"),
    pytest.param(
        ingest_suggestions_contributions, "_INSERT", _suggestions_df, id="suggestions"
    ),
]


@pytest.mark.parametrize(("module", "insert_name", "make_df"), CASES)
def test_schema_is_consistent(module: ModuleType, insert_name: str, make_df):
    table_columns, primary_key = create_table_columns(module._CREATE_TABLE)
    insert = insert_parts(getattr(module, insert_name))

    assert insert["columns"] == table_columns
    assert insert["placeholders"] == len(table_columns)
    assert insert["non_placeholders"] == ""
    assert insert["conflict"] == primary_key

    if insert["update"] is None:
        assert insert["do_nothing"]
    else:
        # Every non-key column is updated, from its own EXCLUDED value.
        assert all(target == source for target, source in insert["update"])
        updated = [target for target, _ in insert["update"]]
        assert updated == [c for c in table_columns if c not in primary_key]

    rows = module._rows_from_df(make_df(), "2026-11-01")
    assert rows
    assert all(len(row) == len(table_columns) for row in rows)
