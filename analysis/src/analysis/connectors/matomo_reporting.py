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
        date_end: str,
        *,
        period: str = "week",
        label_pattern: str | None = None,
    ) -> dict[str, list[dict[str, Any]]]:
        """Return the flat page-URL report for every ``period`` in ``[start, end]``.

        The result maps a Matomo period label to that period's flat list of
        page-URL rows. Labels are range-strings: ``"2025-01-06,2025-01-12"`` for a
        week, ``"2026-01-01,2026-01-31"`` for a month. Each row carries at least
        ``label``/``url`` and the ``nb_hits`` (page views) and ``nb_visits``
        metrics. ``filter_limit=-1`` disables Matomo's default truncation so we
        get *every* personalized URL, not just the top N.

        ``period`` is any Matomo period (``"week"``, ``"month"``, …); a date range
        with ``period="month"`` yields one bucket per calendar month.
        ``label_pattern`` (a regex) is pushed down to Matomo as a server-side
        ``label`` filter, so only matching page paths cross the wire — passing
        ``"contribution"`` shrinks a whole-site report to just the pages we plot.
        """
        params: dict[str, Any] = {
            "period": period,
            "date": f"{date_start},{date_end}",
            "flat": 1,
            "filter_limit": -1,
        }
        if label_pattern:
            params["filter_column"] = "label"
            params["filter_pattern"] = label_pattern
        return self._call("Actions.getPageUrls", **params)

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> MatomoReportingConnector:
        return self

    def __exit__(self, *_exc: object) -> None:
        self.close()
