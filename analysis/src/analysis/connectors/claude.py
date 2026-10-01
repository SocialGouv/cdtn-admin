"""Connector to the Claude (Anthropic) API — chat completions only.

Raw HTTP via ``httpx`` (already a project dependency), not the ``anthropic``
SDK — for call sites that want Claude instead of Albert for a single-turn
generation task without adding a new dependency (e.g.
:mod:`analysis.l2.describe_classes`). ``ClaudeClient.generate`` matches
:meth:`analysis.connectors.albert.AlbertClient.generate`'s signature, so the
two are interchangeable at call sites.

Also exposes the Message Batches API (``create_batch``/``get_batch``/
``iter_batch_results``) for call sites that don't need an immediate
response and want the flat 50% cost cut -- e.g.
:mod:`analysis.l2.extract_facets`, whose whole job is already an
asynchronous, checkpointed, multi-hour background run, which is exactly
what batches are for.

Docs: https://docs.claude.com/en/api/messages,
https://docs.claude.com/en/build-with-claude/batch-processing
"""

from __future__ import annotations

import json
import random
import time
from collections.abc import Iterator

import httpx

from analysis.config import AnthropicSettings

_API_URL = "https://api.anthropic.com/v1/messages"
_BATCHES_URL = f"{_API_URL}/batches"
_API_VERSION = "2023-06-01"

# 429 (rate limit), 529 (overloaded -- Anthropic's "too much traffic right
# now" signal), and 5xx are all transient: routinely resolve within seconds
# and are meant to be retried, not treated as a permanent failure.
_RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 529}
_MAX_BACKOFF_SECONDS = 30.0


class ClaudeClient:
    """Thin synchronous wrapper around the Claude Messages (+ Batches) API."""

    def __init__(self, settings: AnthropicSettings | None = None) -> None:
        self._settings = settings or AnthropicSettings()

    @property
    def model(self) -> str:
        """The configured model id -- needed by callers building their own
        batch request ``params`` (see :meth:`create_batch`), which
        :meth:`generate` fills in internally for a single call.
        """
        return self._settings.anthropic_model

    def _headers(self) -> dict[str, str]:
        headers = {
            "content-type": "application/json",
            "x-api-key": self._settings.anthropic_api_key,
            "anthropic-version": _API_VERSION,
        }
        # Only needed for an API key that isn't scoped to a single workspace
        # (org-level keys) -- such a key is rejected with a 400
        # invalid_request_error unless this header is present. A
        # workspace-scoped key (the normal case -- create one under a
        # specific workspace in the Console) doesn't need it at all.
        if self._settings.anthropic_workspace_id:
            headers["anthropic-workspace-id"] = self._settings.anthropic_workspace_id
        return headers

    def _request(
        self,
        method: str,
        url: str,
        *,
        json_body: dict | None,
        timeout: float,
        max_retries: int,
    ) -> httpx.Response:
        """Shared retry-on-transient-failure request, used by every method
        below. Retries on 429/5xx/529 (see ``_RETRYABLE_STATUS_CODES``) with
        exponential backoff, honoring a ``retry-after`` response header when
        present. These routinely clear within seconds; without a retry here,
        one blip aborts an entire multi-hour batch job (e.g.
        :mod:`analysis.l2.extract_facets`) instead of costing a short pause.
        """
        response = None
        for attempt in range(max_retries + 1):
            response = httpx.request(
                method,
                url,
                headers=self._headers(),
                json=json_body,
                timeout=timeout,
            )
            if response.status_code not in _RETRYABLE_STATUS_CODES:
                break
            if attempt < max_retries:
                time.sleep(self._retry_delay(response, attempt))

        assert response is not None
        if response.is_error:
            # raise_for_status() alone drops the response body, which is
            # where Anthropic puts the actually useful part of a 4xx --
            # e.g. {"error": {"type": "invalid_request_error", "message": "..."}}.
            raise httpx.HTTPStatusError(
                f"{response.status_code} {response.reason_phrase} calling "
                f"{url} (after {attempt + 1} attempt(s)): {response.text}",
                request=response.request,
                response=response,
            )
        return response

    def generate(
        self,
        prompt: str,
        *,
        max_tokens: int = 1024,
        timeout: float = 60.0,
        max_retries: int = 5,
    ) -> str:
        """Send ``prompt`` as the sole user message and return the reply text."""
        response = self._request(
            "POST",
            _API_URL,
            json_body={
                "model": self._settings.anthropic_model,
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=timeout,
            max_retries=max_retries,
        )
        content = response.json()["content"]
        return "".join(block["text"] for block in content if block["type"] == "text")

    def create_batch(
        self,
        requests: list[dict],
        *,
        timeout: float = 60.0,
        max_retries: int = 5,
    ) -> dict:
        """Submit a batch of Messages API requests -- 50% cheaper than the
        same calls via :meth:`generate`, at the cost of asynchronous (up to
        ~24h, usually under 1h) completion. Each request:
        ``{"custom_id": str, "params": {...same shape as a single
        messages.create call...}}`` -- ``custom_id`` must match
        ``^[a-zA-Z0-9_-]{1,64}$`` and is how you match a result back to its
        request (results can return in any order). Up to 100,000 requests
        or 256 MB per batch; callers are expected to stay under that rather
        than this method chunking for them.

        Returns the created batch object (``id``, ``processing_status``,
        ``request_counts``, ``results_url`` -- ``None`` until processing
        ends).
        """
        response = self._request(
            "POST",
            _BATCHES_URL,
            json_body={"requests": requests},
            timeout=timeout,
            max_retries=max_retries,
        )
        return response.json()

    def get_batch(
        self,
        batch_id: str,
        *,
        timeout: float = 60.0,
        max_retries: int = 5,
    ) -> dict:
        """Current state of a batch -- poll ``["processing_status"]`` until
        it's ``"ended"``, at which point ``["results_url"]`` is populated.
        """
        response = self._request(
            "GET",
            f"{_BATCHES_URL}/{batch_id}",
            json_body=None,
            timeout=timeout,
            max_retries=max_retries,
        )
        return response.json()

    def iter_batch_results(
        self,
        results_url: str,
        *,
        timeout: float = 300.0,
        max_retries: int = 5,
    ) -> Iterator[dict]:
        """Stream a finished batch's ``.jsonl`` results, one parsed dict per
        line: ``{"custom_id": str, "result": {"type": "succeeded" |
        "errored" | "canceled" | "expired", "message": {...} | "error":
        {...}}}``. Results can come back in any order -- always match on
        ``custom_id``, never on position.
        """
        response = self._request(
            "GET", results_url, json_body=None, timeout=timeout, max_retries=max_retries
        )
        for line in response.text.splitlines():
            if line.strip():
                yield json.loads(line)

    @staticmethod
    def _retry_delay(response: httpx.Response, attempt: int) -> float:
        retry_after = response.headers.get("retry-after")
        if retry_after is not None:
            try:
                return float(retry_after)
            except ValueError:
                pass
        return min(2**attempt, _MAX_BACKOFF_SECONDS) + random.uniform(0, 1)
