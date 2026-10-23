"""L2 content-taxonomy audit.

Builds a semantic "signature" for every L2 (sub-theme) of code.travail.gouv.fr
from its documents' embeddings and LLM-extracted facets, then uses it for
editorial tasks: flagging possibly-misclassified documents, suggesting
complementary L2s, recommending cross-links between sources, matching
free-text questions to L2s, and drafting L2 descriptions.

An occasional, manual audit tool (not part of ``ingest-all``). One CLI,
``uv run l2 <step>`` (see :mod:`analysis.l2.cli`); each step reads and writes
artifacts independently. Full documentation: ``README.md`` in this package.
"""
