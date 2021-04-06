let ES_INDEX_PREFIX =
  process.env.ES_INDEX_PREFIX ??
  `cdtn-feature-${process.env.CI_ENVIRONMENT_SLUG}`;

if (process.env.CI_COMMIT_REF_SLUG === "master") {
  ES_INDEX_PREFIX = "cdtn-master";
}

const target = process.env.INGESTER_ELASTICSEARCH_TARGET;

if (target === "preprod") {
  ES_INDEX_PREFIX = `cdtn-preprod-${process.env.CI_COMMIT_TAG}`;
} else if (target === "prod") {
  ES_INDEX_PREFIX = `cdtn-prod-${process.env.CI_COMMIT_TAG}`;
}

export { ES_INDEX_PREFIX };
