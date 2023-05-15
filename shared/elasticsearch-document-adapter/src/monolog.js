import { Client } from "@elastic/elasticsearch";
import { logger } from "@socialgouv/cdtn-logger";
import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-sources";

const COVISIT_BATCH_SIZE = 500;

const reportType = "covisit";

const covisitsMap = new Map();

/**
 * Read covisits from Elastic logs reports and build
 * a map in-memory in order to access them efficiently during ingestion
 * @param esLogs
 * @param esLogsToken
 * @return {Promise<void>}
 */
export const buildCovisitMap = async (esLogs, esLogsToken) => {
  const esClientConfig = {
    auth: { apiKey: esLogsToken },
    node: esLogs,
  };

  const client = new Client(esClientConfig);

  const query = { term: { reportType } };

  const count = (
    await client.count({
      body: { query },
      index: "log_reports",
    })
  ).body.count;

  // split calls into batches
  for (let b = 0; b <= Math.floor(count / COVISIT_BATCH_SIZE); b++) {
    const results = await client.search({
      body: { query },
      from: b * COVISIT_BATCH_SIZE,
      index: "log_reports",
      size: COVISIT_BATCH_SIZE,
    });
    const hits = results.body.hits?.hits;
    hits.forEach(({ _source: { content, links } }) => {
      covisitsMap.set(content, links);
    });
  }

  logger.info(`${covisitsMap.size} covisits found`);
};

/**
 * Look for covisits for a given doc and add them
 * if available
 * @param doc
 */
export const addCovisits = (doc) => {
  let sourceRoute = getRouteBySource(doc.source);

  // special case for fiches MT
  if (doc.source == SOURCES.SHEET_MT_PAGE) {
    sourceRoute = getRouteBySource(SOURCES.SHEET_MT);
  }

  const path = `${sourceRoute}/${doc.slug}`;

  doc.covisits = covisitsMap.get(path);
};
