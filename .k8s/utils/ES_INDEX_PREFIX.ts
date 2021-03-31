let ES_INDEX_PREFIX =
  process.env.ES_INDEX_PREFIX ??
  `cdtn-feature-${process.env.CI_ENVIRONMENT_SLUG}`;

if (process.env.CI_COMMIT_REF_SLUG === "master") {
  ES_INDEX_PREFIX = "cdtn-master";
}

if (process.env.CI_COMMIT_TAG) {
  ES_INDEX_PREFIX = `cdtn-preprod-${process.env.CI_COMMIT_TAG}`;
}

if (process.env.PRODUCTION) {
  ES_INDEX_PREFIX = `cdtn-prod-${process.env.CI_COMMIT_TAG}`;
}

export { ES_INDEX_PREFIX };
