"""Integration tests of the three clarity widget tables against a real PostgreSQL.

They run the real ingesters (CREATE TABLE + upsert through
``MetabaseDBConnector``) with a stubbed Matomo replica, then run the Metabase
card queries documented in the README. Everything happens in a throwaway schema
(the connection ``search_path`` points to it), so existing tables are never
touched.

Skipped when the Metabase database is not reachable (CI, no Docker): start it
with ``docker compose up -d metabase-db`` to run them.
"""

from __future__ import annotations

import datetime as dt
import re
import uuid
from pathlib import Path

import pandas as pd
import psycopg
import pytest

from analysis.commands import (
    ingest_notation_contributions,
    ingest_notation_contributions_pages,
    ingest_suggestions_contributions,
)
from analysis.config import MetabaseDBSettings
from analysis.connectors.metabase_db import MetabaseDBConnector
from analysis.reports import notation_contributions, suggestions_contributions

README = Path(__file__).resolve().parents[1] / "README.md"
BASE = "https://code.travail.gouv.fr"
SLUG = "les-conges-payes"
CC_SLUG = "1486-les-conges-payes"
# Cards filter on the last 90 days, today excluded.
DAY = (dt.date.today() - dt.timedelta(days=1)).isoformat()


def _base_conninfo() -> str:
    s = MetabaseDBSettings()
    return (
        f"host={s.metabase_db_host} port={s.metabase_db_port} "
        f"dbname={s.metabase_db_name} user={s.metabase_db_user} "
        f"password={s.metabase_db_password} connect_timeout=2"
    )


def _database_available() -> bool:
    try:
        with psycopg.connect(_base_conninfo()):
            return True
    except psycopg.Error:
        return False


pytestmark = pytest.mark.skipif(
    not _database_available(),
    reason="Metabase PostgreSQL not reachable (docker compose up -d metabase-db)",
)


class _SchemaConnector(MetabaseDBConnector):
    """Connector whose tables land in a dedicated schema."""

    def __init__(self, schema: str) -> None:
        super().__init__()
        self._schema = schema

    def _conninfo(self) -> str:
        return f"{_base_conninfo()} options=-csearch_path={self._schema}"


def _page_view(visit: int, path: str, os: str = "Windows") -> dict:
    return {
        "idvisit": visit,
        "action_timestamp": pd.Timestamp(f"{DAY} 10:00:00"),
        "operatingsystemname": os,
        "action_type": "action",
        "action_url": f"{BASE}{path}",
        "action_eventcategory": None,
        "action_eventaction": None,
        "action_eventname": None,
    }


def _event(
    visit: int,
    action: str,
    slug: str = SLUG,
    category: str = "clarte_contribution",
    os: str = "Windows",
    time: str = "10:05:00",
) -> dict:
    return {
        "idvisit": visit,
        "action_timestamp": pd.Timestamp(f"{DAY} {time}"),
        "operatingsystemname": os,
        "action_type": "event",
        "action_url": f"{BASE}/contribution/{slug}",
        "action_eventcategory": category,
        "action_eventaction": action,
        "action_eventname": f"contribution/{slug}",
    }


def _suggestion(visit: int, text: str, slug: str = SLUG, **kwargs) -> dict:
    return _event(
        visit, text, slug=slug, category="clarte_contribution_suggestion", **kwargs
    )


EVENTS = pd.DataFrame(
    [
        # 3 visits on the generic page, 1 (mobile) on a collective agreement page.
        _page_view(1, f"/contribution/{SLUG}"),
        _page_view(2, f"/contribution/{SLUG}"),
        _page_view(3, f"/contribution/{SLUG}?q=1#top"),
        _page_view(4, f"/contribution/{CC_SLUG}", os="Android"),
        # Widget events.
        _event(10, "note_1"),
        _event(11, "note_3"),
        _event(12, "note_2", slug=CC_SLUG, os="Android"),
        _event(10, "raison_texte_difficile"),
        _event(10, "raison_informations_fausses"),
        _event(13, "remarque"),
        # Historical 5-point scale: never ingested.
        _event(14, "note_5", category="notation_contribution"),
        _suggestion(10, "Ajoutez un exemple", time="10:06:00"),
        _suggestion(13, "note_2", slug=CC_SLUG, os="Android", time="10:07:00"),
    ]
)


class _FakeReplica:
    """Stands for ``MatomoSQLConnectorSync``: returns the stub events.

    The suggestions report queries its category only (3 parameters), the
    counters reports query page views + both widget categories.
    """

    def __enter__(self) -> _FakeReplica:
        return self

    def __exit__(self, *exc: object) -> None:
        return None

    def run_query_df(self, query: str, params: tuple) -> pd.DataFrame:
        if len(params) == 3:
            return EVENTS[
                EVENTS["action_eventcategory"] == "clarte_contribution_suggestion"
            ].reset_index(drop=True)
        return EVENTS.reset_index(drop=True)


@pytest.fixture
def schema(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(notation_contributions, "MatomoSQLConnectorSync", _FakeReplica)
    monkeypatch.setattr(
        suggestions_contributions, "MatomoSQLConnectorSync", _FakeReplica
    )
    name = f"test_clarity_{uuid.uuid4().hex[:8]}"
    with psycopg.connect(_base_conninfo(), autocommit=True) as conn:
        conn.execute(f'CREATE SCHEMA "{name}"')
    try:
        yield name
    finally:
        with psycopg.connect(_base_conninfo(), autocommit=True) as conn:
            conn.execute(f'DROP SCHEMA "{name}" CASCADE')


def _ingest_all(schema: str) -> None:
    connector = _SchemaConnector(schema)
    for module in (
        ingest_notation_contributions,
        ingest_notation_contributions_pages,
        ingest_suggestions_contributions,
    ):
        module.ingest_day(None, connector, DAY)


def _query(schema: str, sql: str) -> list[tuple]:
    with psycopg.connect(_base_conninfo()) as conn:
        conn.execute(f'SET search_path TO "{schema}"')
        return conn.execute(sql).fetchall()


def test_tables_hold_the_expected_rows(schema: str) -> None:
    _ingest_all(schema)

    assert _query(
        schema,
        "SELECT device, nb_visites_contributions, nb_notes_1, nb_notes_2, nb_notes_3,"
        " nb_raisons_texte_difficile, nb_raisons_informations_fausses,"
        " nb_remarques, nb_suggestions"
        " FROM notation_contributions ORDER BY device",
    ) == [
        ("desktop", 3, 1, 0, 1, 1, 1, 1, 1),
        ("mobile", 1, 0, 1, 0, 0, 0, 0, 1),
    ]

    assert _query(
        schema,
        "SELECT page, nb_visites, nb_notes_1, nb_notes_2, nb_notes_3,"
        " nb_remarques, nb_suggestions"
        " FROM notation_contributions_pages ORDER BY page",
    ) == [
        (CC_SLUG, 1, 0, 1, 0, 0, 1),
        (SLUG, 3, 1, 0, 1, 1, 1),
    ]

    assert _query(
        schema,
        "SELECT page, device, suggestion FROM suggestions_contributions"
        " ORDER BY horodatage",
    ) == [
        (SLUG, "desktop", "Ajoutez un exemple"),
        # Free text that looks like an action is still a verbatim.
        (CC_SLUG, "mobile", "note_2"),
    ]


def test_running_a_day_twice_creates_no_duplicates(schema: str) -> None:
    _ingest_all(schema)
    _ingest_all(schema)

    for table, expected in (
        ("notation_contributions", 2),
        ("notation_contributions_pages", 2),
        ("suggestions_contributions", 2),
    ):
        assert _query(schema, f"SELECT count(*) FROM {table}") == [(expected,)]


def _readme_card_queries() -> list[str]:
    section = README.read_text().split("### Metabase cards (clarity widget)", 1)[1]
    section = re.split(r"\n#{2,3} ", section, maxsplit=1)[0]
    return [
        block.strip()
        for block in re.findall(r"```sql\n(.*?)```", section, re.S)
        if block.strip()
    ]


def test_readme_card_queries_run_on_the_tables(schema: str) -> None:
    _ingest_all(schema)
    queries = _readme_card_queries()

    assert len(queries) == 5
    results = [_query(schema, re.sub(r"(?m)^ {3}", "", sql)) for sql in queries]
    assert all(result for result in results)
    # Card 1: 3 ratings / 4 visits, average (1 + 2 + 3) / 3.
    ratings, visits, rate, average = results[0][0]
    assert (ratings, visits) == (3, 4)
    assert float(rate) == pytest.approx(0.75)
    assert float(average) == pytest.approx(2.0)
    # Card 5: the two verbatims, newest first.
    assert len(results[4]) == 2
