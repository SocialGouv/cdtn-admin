"""Connector to the Matomo HTTP Reporting API.

Unlike :class:`~analysis.connectors.matomo.MatomoSQLConnector` (which reads the
raw event table on the Postgres replica), this talks to Matomo's public
Reporting API over HTTPS. It is the right tool for *page-view* metrics per URL
per period, which the replica's event-only table does not expose.

Docs: https://developer.matomo.org/api-reference/reporting-api#Actions
"""

from __future__ import annotations

from typing import Any

import httpx

from analysis.config import ReportingSettings


class MatomoReportingError(RuntimeError):
    """Raised when the Matomo Reporting API returns an error payload."""


class MatomoReportingConnector:
    """Thin synchronous wrapper around the Matomo Reporting API.

    Usage::

        with MatomoReportingConnector() as matomo:
            months = matomo.get_page_urls(
                "2026-01-01", "2026-06-30", period="month"
            )
    """

    def __init__(
        self,
        settings: ReportingSettings | None = None,
        *,
        timeout: float = 60.0,
    ) -> None:
        self._settings = settings or ReportingSettings()
        self._base_url = self._settings.matomo_base_url.rstrip("/")
        self._client = httpx.Client(timeout=timeout)

    def _endpoint(self) -> str:
        # Matomo exposes the API through index.php; accept either form in config.
        if self._base_url.endswith("index.php"):
            return self._base_url
        return f"{self._base_url}/index.php"

    def _call(self, method: str, **params: Any) -> Any:
        """POST a Reporting API call and return the decoded JSON payload."""
        payload = {
            "module": "API",
            "method": method,
            "idSite": self._settings.matomo_site_id,
            "format": "JSON",
            "token_auth": self._settings.matomo_token_auth,
            **params,
        }
        # token_auth travels in the POST body, never the query string.
        response = self._client.post(self._endpoint(), data=payload)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, dict) and data.get("result") == "error":
            raise MatomoReportingError(data.get("message", "unknown Matomo error"))
        return data

    def get_page_urls(
        self,
        date_start: str,
        date_end: str | None = None,
        *,
        period: str = "week",
        filter_pattern: str | None = None,
        filter_column: str | None = None,
        segment: str | None = None,
        filter_limit: int = -1,
        flat: bool = False,
    ) -> list[dict[str, Any]] | dict[str, list[dict[str, Any]]]:
        """Return the ``Actions.getPageUrls`` report as a flat list or per period.

        Each row carries at least ``label``/``url`` plus the ``nb_hits`` (page
        views) and ``nb_visits`` metrics. ``filter_limit=-1`` disables Matomo's
        default truncation so *every* URL is returned, not just the top N.

        Date range:

        * pass only ``date_start`` for a single period (e.g. one day);
        * pass ``date_end`` too for a ``start,end`` range — with
          ``period="month"`` this yields one bucket per calendar month.

        Return shape is driven by ``flat``:

        * ``flat=False`` (default) returns a ``dict`` mapping each Matomo period
          label (a range-string like ``"2026-01-01,2026-01-31"``) to that period's
          list of rows — the right shape for a multi-period range.
        * ``flat=True`` returns a single flat ``list`` of rows, concatenating every
          period. Use it for a single-period query (one day) where the per-period
          grouping is noise.

        Filtering: ``filter_pattern`` (a regex) is pushed down to Matomo so only
        matching rows cross the wire. It matches the default column — the page
        path — unless ``filter_column`` overrides it (``"label"`` filters on the
        page label, e.g. ``filter_pattern="contribution"`` to keep only
        ``/contribution/`` pages). ``segment`` restricts the whole report to a
        Matomo segment (e.g. ``"deviceType==smartphone"``).
        """
        date = date_start if date_end is None else f"{date_start},{date_end}"
        params: dict[str, Any] = {
            "period": period,
            "date": date,
            "flat": 1,
            "filter_limit": filter_limit,
        }
        if filter_pattern:
            params["filter_pattern"] = filter_pattern
            if filter_column:
                params["filter_column"] = filter_column
        if segment:
            params["segment"] = segment
        data = self._call("Actions.getPageUrls", **params)
        if not flat:
            return data
        # A single-period call returns a bare list; a multi-period range returns a
        # {period_label: [rows]} dict. Concatenate to one flat list either way.
        if isinstance(data, dict):
            return [row for rows in data.values() for row in rows]
        return data

    def get_events_action(
        self,
        date: str,
        *,
        period: str = "day",
        filter_pattern: str | None = None,
        secondary_dimension: str = "eventName",
        segment: str | None = None,
        filter_limit: int = -1,
    ) -> list[dict[str, Any]]:
        """Return the flat ``Events.getAction`` report for ``date``.

        Each row carries at least ``Events_EventAction`` and the ``nb_visits``
        metric. ``filter_pattern`` (a regex) is pushed down to Matomo so only
        matching event actions cross the wire; ``secondaryDimension`` defaults to
        ``eventName`` (so ``flat`` mode expands one row per action/name pair).
        ``segment`` restricts the report to a Matomo segment. ``filter_limit=-1``
        (the default) disables Matomo's row truncation, matching
        :meth:`get_page_urls` — important here since a single event action can
        flatten into one row per distinct event name (e.g. one per contribution
        slug), and the default limit would silently drop the long tail.
        """
        params: dict[str, Any] = {
            "period": period,
            "date": date,
            "secondaryDimension": secondary_dimension,
            "flat": 1,
            "filter_limit": filter_limit,
        }
        if filter_pattern:
            params["filter_pattern"] = filter_pattern
        if segment:
            params["segment"] = segment
        return self._call("Events.getAction", **params)

    def get_visits_summary(
        self,
        date: str,
        *,
        period: str = "day",
        segment: str | None = None,
    ) -> int:
        """Return ``nb_visits`` from ``VisitsSummary.get`` for ``date``/``segment``.

        Unlike :meth:`get_page_urls` (one row per URL), ``VisitsSummary.get``
        returns a single aggregate for whatever the segment matches — the right
        call when the caller has already built a segment expression (e.g. an
        OR of several ``pageUrl`` clauses for one contribution slug, possibly
        ANDed with a device segment) and only wants the total visit count for
        it, not a per-URL breakdown.
        """
        params: dict[str, Any] = {"period": period, "date": date}
        if segment:
            params["segment"] = segment
        data = self._call("VisitsSummary.get", **params)
        if isinstance(data, dict):
            return int(data.get("nb_visits", 0) or 0)
        return 0

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> MatomoReportingConnector:
        return self

    def __exit__(self, *_exc: object) -> None:
        self.close()
