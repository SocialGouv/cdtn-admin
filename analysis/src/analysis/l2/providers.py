"""Embedding providers available to the L2 steps (single registry).

Every step that embeds text (facets, questions) takes ``--provider`` from
here. Use the same provider across docs, facets and questions: the pipeline
compares them by cosine similarity, only meaningful in one embedding space.
"""

from __future__ import annotations

from analysis.connectors.albert import embed_texts as albert_embed_texts
from analysis.connectors.openai import embed_texts as openai_embed_texts

DEFAULT_PROVIDER = "openai"

PROVIDERS = {
    "openai": openai_embed_texts,
    "albert": albert_embed_texts,
}
