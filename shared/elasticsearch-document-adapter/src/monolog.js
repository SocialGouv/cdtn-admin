import { Client } from "@elastic/elasticsearch";
import { logger } from "@socialgouv/cdtn-logger";
import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-sources";

const COVISIT_BATCH_SIZE = 500;

const reportType = "covisit";

const covisitsMap = new Map();

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

export const addCovisits = (doc) => {
  let sourceRoute = getRouteBySource(doc.source);

  // special case for fiches MT
  if (doc.source == SOURCES.SHEET_MT_PAGE) {
    sourceRoute = getRouteBySource(SOURCES.SHEET_MT);
  }

  const path = `${sourceRoute}/${doc.slug}`;

  doc.covisits = covisitsMap.get(path);
};
