"""Connector to the cdtn-search Elasticsearch cluster (documents source).

Used by the L2 pipeline (``analysis.l2.build_docs``) to pull every published,
searchable document — the raw material for embeddings, facet extraction and
theme (L2/L1) labelling.
"""

from __future__ import annotations

from types import TracebackType
from typing import Any

from elasticsearch import Elasticsearch, helpers

from analysis.config import ElasticsearchSettings

# DEFAULT_INDEX = "cdtn-linked-related-content_documents"
DEFAULT_INDEX = "cdtn-preprod-v2_documents"

# Only sources that carry real editorial content and a theme breadcrumb.
DEFAULT_SOURCES: tuple[str, ...] = (
    "fiches_service_public",
    "fiches_ministere_travail",
    "modeles_de_courriers",
    "outils",
    "contributions",
    "external",
    "dossiers",
    "information",
    "infographies",
)

DEFAULT_FIELDS: tuple[str, ...] = (
    "title",
    "text",
    "slug",
    "source",
    "breadcrumbs",
)


class ElasticsearchDocsConnector:
    """Synchronous wrapper around the cdtn-search ES cluster.

    Usage::

        with ElasticsearchDocsConnector() as es:
            docs = es.fetch_documents()
    """

    def __init__(
        self,
        settings: ElasticsearchSettings | None = None,
        *,
        index: str = DEFAULT_INDEX,
    ) -> None:
        self._settings = settings or ElasticsearchSettings()
        self._index = index
        self._client = Elasticsearch(
            [self._settings.elasticsearch_search_engine_host],
            basic_auth=(
                self._settings.elasticsearch_search_engine_user,
                self._settings.elasticsearch_search_engine_password,
            ),
        )

    def ping(self) -> bool:
        return bool(self._client.ping())

    def fetch_documents(
        self,
        *,
        sources: tuple[str, ...] = DEFAULT_SOURCES,
        fields: tuple[str, ...] = DEFAULT_FIELDS,
    ) -> list[dict[str, Any]]:
        """Return every published, searchable document as a list of dicts.

        Each dict carries ``id`` (the ES ``_id``) plus ``fields``. Uses
        ``elasticsearch.helpers.scan`` rather than a single bounded ``size``
        request — the corpus is well past the 10 000-document default result
        window ES enforces, and a fixed ``size`` would silently truncate it as
        the corpus grows.
        """
        query = {
            "bool": {
                "filter": [
                    {"term": {"excludeFromSearch": False}},
                    {"term": {"isPublished": True}},
                ],
                "must": {"terms": {"source": list(sources)}},
            }
        }
        docs = []
        for hit in helpers.scan(
            self._client,
            index=self._index,
            query={"query": query, "_source": list(fields)},
        ):
            doc = dict(hit["_source"])
            doc["id"] = hit["_id"]
            docs.append(doc)
        return docs

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> ElasticsearchDocsConnector:
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        self.close()
