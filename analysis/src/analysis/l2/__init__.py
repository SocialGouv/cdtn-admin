"""L2 content-taxonomy pipeline.

Builds a semantic "signature" for every L2 (sub-theme) of code.travail.gouv.fr
from its member documents' embeddings and LLM-extracted facets, then uses
those signatures for editorial use cases: flagging possibly-misclassified
documents, suggesting complementary L2s for a document, matching free-text
questions to the L2s that best answer them, and drafting a public
description of each L2. A further stage recommends individual documents
across sources directly, without going through L2 signatures at all.

This is an occasional content-audit tool, not a daily metric — it is run
manually, stage by stage, not through the ``ingest-*``/Metabase cronjob:

1. ``analysis.l2.build_docs``          — Elasticsearch -> docs.csv, l2_l1.json
2. ``analysis.l2.extract_facets``      — docs.csv + l2_l1.json -> facets_raw.csv
                                          (Claude, slow -- no embeddings yet)
2b. ``analysis.l2.embed_facets``       — facets_raw.csv -> facets.csv (embeddings,
                                          provider-selectable, decoupled from
                                          extraction so a different embedding
                                          model never requires re-extracting)
2c. ``analysis.l2.canonicalize_facets`` — facets.csv -> facets.csv + canonical_facet
                                          (optional; merges near-duplicate phrasings)
3. ``analysis.l2.build_sessions``      — Matomo -> sessions.parquet (co-click logs)
4. ``analysis.l2.embed_questions``     — a raw questions CSV -> questions.parquet
5. ``analysis.l2.run_pipeline``        — everything above -> Excel exports for review
6. ``analysis.l2.describe_classes``    — docs.csv + facets.csv -> a public description
                                          + keywords per L2 (Claude, not Albert)
7. ``analysis.l2.recommend_content``   — docs.csv + facets.csv -> cross-source document
                                          recommendations (no L2 signatures needed)
8. ``analysis.l2.complementary_embeddings`` — docs.csv + l2_l1.json -> use case 2 alone,
                                          embeddings-only (no facets.csv, no sessions,
                                          runs outside ``run_pipeline``)
9. ``analysis.l2.recommend_links``     — docs.csv + facets.csv (with canonical_facet)
                                          + l2_l1.json -> complementary L2s and
                                          cross-source document recommendations, ranked
                                          *together* by canonical facet overlap

``analysis.l2.signatures`` and ``analysis.l2.use_cases`` hold the pure,
network-free logic shared by stages 5-6; ``analysis.l2.io`` holds the on-disk
artifact format (CSV for docs/facets -- so a hand-produced file can drop in
directly -- Parquet for sessions/questions).
"""
