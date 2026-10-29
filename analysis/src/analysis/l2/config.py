"""Central defaults for the L2 steps.

Every tunable threshold / weight / pool size lives here, grouped by step, so
that CLIs, library functions and docs all read one source of truth. Modules
import from here (and some re-export, to keep old import paths working).
"""

from __future__ import annotations

# --------------------------------------------------------------------------- #
# docs step
# --------------------------------------------------------------------------- #

# Not empirically tuned against labelled data -- chosen for architectural
# soundness: most documents (median ~6K chars) still land in 1-2 chunks,
# unchanged from today's single-embedding behavior, while the long tail
# (up to 115K chars) gets full coverage instead of silent truncation.
CHUNK_CHARS = 4000

# --------------------------------------------------------------------------- #
# facets step
# --------------------------------------------------------------------------- #

# Cosine threshold for agglomerative clustering of facet texts into
# `canonical_facet` (canonicalize_facets). NOT the same as
# FACET_MATCH_THRESHOLD below, even though both are 0.92 today.
CANONICAL_CLUSTER_THRESHOLD = 0.92

# --------------------------------------------------------------------------- #
# signatures step (class-level L2 vectors)
# --------------------------------------------------------------------------- #

# Trust given to each facet type relative to the doc centroid's weight of 1.0.
SIGNATURE_FACET_TYPE_WEIGHTS: dict[str, float] = {
    "topic": 0.30,
    "entity": 0.15,
    "claim": 0.05,
}
# Weight kept on an L2's own content = n_docs / (n_docs + k); small classes
# borrow more from their L1.
SIGNATURE_SHRINKAGE_K = 5.0
SIGNATURE_TRIM_FRACTION = 0.1
# Same shrinkage idea, but over *sessions* for co-click profiles (use_cases).
COCLICK_SHRINKAGE_K = 3.0
# Weight of the facet bridge vs embedding similarity in the content-only
# complementary-L2 use case.
COMPLEMENTARY_FACET_WEIGHT = 0.7

# --------------------------------------------------------------------------- #
# links step (recommend_links / explain_links / fit_weights)
# --------------------------------------------------------------------------- #

DEFAULT_SOURCE = "fiches_service_public"
DEFAULT_TARGET_SOURCES: tuple[str, ...] = (
    "modeles_de_courriers",
    "contributions",
    "outils",
)
DEFAULT_L2_POOL = 8
DEFAULT_L2_TOP_K = 2
DEFAULT_DOC_POOL = 12
DEFAULT_DOC_TOP_K = 3
# Tuned on human good/bad votes (tools/votes/link_tags.csv), see README
# l2/README.md "Réglage de l2 links recommend": 0.75 dropped half of the links editors
# voted good (and left ~87% of fiches without any document link).
DEFAULT_MIN_SIMILARITY = 0.60
# "doc": gate/rank document candidates by whole-document embedding cosine
# similarity (production default). "facet": gate/rank by the single highest
# facet-to-facet cosine similarity between the two documents instead -- a
# long, multi-topic source document's whole-document vector can be too
# diluted to clear the floor against a narrowly-focused candidate that
# closely matches on just one facet; this rescues that case.
DOCUMENT_SIMILARITY_METRICS: tuple[str, ...] = ("doc", "facet")
DEFAULT_SIMILARITY_METRIC = "doc"
# What counts as "the same facet" for n_shared_canonical_facets. "canonical"
# (default) groups by the clustered `canonical_facet` column from
# `l2 facets canonicalize`: paraphrases ("préavis de démission" / "délai de
# préavis en cas de démission") count as shared, but that depends on the
# clustering's similarity threshold, which can occasionally over- or
# under-merge. "raw" groups by the literal per-document `text` instead: only
# exact wording counts as shared -- lower recall, but no clustering step
# (works even if `l2 facets canonicalize` was never run) and no risk of two
# genuinely different concepts being merged by an over-eager threshold.
# "embedding" (DOCUMENT candidates only -- see rank_document_candidates)
# greedily matches facet embeddings pairwise per document pair instead of
# any text column at all: catches paraphrases like "canonical" does, but
# the fuzzy matching is scoped to one candidate pair rather than clustered
# once, corpus-wide, ahead of time.
FACET_BASES: tuple[str, ...] = ("canonical", "raw", "embedding")
DEFAULT_FACET_BASIS = "canonical"
# Pairwise facet-embedding cosine needed to count two facets as the same
# (facet_basis="embedding"). Distinct from CANONICAL_CLUSTER_THRESHOLD.
DEFAULT_FACET_MATCH_THRESHOLD = 0.92

DEFAULT_L2_PROFILE_TOP_N = 20  # per facet type, so up to ~60 canonical facets/class

# Continuous 0-1 magnitude per source_affinity tier, for combined_score to
# blend -- unlike an ordinal rank, this is a size a linear score can weigh,
# not just an ordering. "same_l1" sits at half of "same_l2", a starting
# assumption, not a measured one.
SOURCE_AFFINITY_SCORE = {
    "same_l2": 1.0,
    "same_l1": 0.5,
    "other_l1": 0.0,
    "not_applicable": 0.0,
}

# Default weights for combined_score -- a starting point chosen to roughly
# preserve the old priority order (overlap first, then type, then affinity,
# then similarity) as a smooth tradeoff instead of a hard cliff; NOT fit on
# any data. Each is a coefficient on an already-explainable, already-
# exported column, so if real usage data (which links get kept, clicked,
# reverted) is ever collected per candidate, these are exactly the
# coefficients a logistic regression over this same feature set would
# re-estimate -- nothing about the features needs to change to do that,
# just these numbers.
DEFAULT_SCORE_WEIGHTS: dict[str, float] = {
    "n_shared_canonical_facets": 0.15,
    "is_document": 0.5,
    "source_affinity": 0.2,
    "embedding_similarity": 0.5,
}

# explain_links widens the pools and loosens the facet score on purpose: it is
# a diagnostic, not a production ranking.
EXPLAIN_L2_POOL = 20
EXPLAIN_DOC_POOL = 30
DEFAULT_FACET_SCORE_THRESHOLD = 0.7
