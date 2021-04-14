const packageVersion = require("../../package.json")
  .version;
const [, major] = packageVersion.match(/^(?:\^|~)?(\d+)/);

let ES_INDEX_PREFIX = `cdtn-feature-v${major}-${process.env.CI_ENVIRONMENT_SLUG}`;

if (process.env.CI_COMMIT_REF_SLUG === "master") {
  ES_INDEX_PREFIX = `cdtn-master-v${major}`;
}

if (process.env.ES_INDEX_PREFIX) {
  ES_INDEX_PREFIX = process.env.ES_INDEX_PREFIX;
}

const target = process.env.INGESTER_ELASTICSEARCH_TARGET;
if (process.env.CI_COMMIT_TAG) {
  const matchVersion = process.env.CI_COMMIT_TAG.match(/^(v\d)+\.(\d+)\.(\d+)/);
  if (matchVersion) {
    const [, major] = matchVersion;
    if (target === "preprod") {
      ES_INDEX_PREFIX = `cdtn-preprod-${major}`;
    } else if (target === "prod") {
      ES_INDEX_PREFIX = `cdtn-prod-${major}`;
    }
  }
}

export { ES_INDEX_PREFIX };
