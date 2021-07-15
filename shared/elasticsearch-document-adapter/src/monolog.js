import { Client } from "@elastic/elasticsearch";
import { logger } from "@socialgouv/cdtn-logger";
import { LogQueries } from "@socialgouv/cdtn-monolog";
import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-sources";

const ES_LOGS = process.env.ES_LOGS;
const ES_LOGS_TOKEN = process.env.ES_LOGS_TOKEN;

if (!ES_LOGS || !ES_LOGS_TOKEN) {
  if (process.env.NODE_ENV != "test") {
    logger.warn(
      `Missing env variable for accessing Monolog Elastic Search logs : ${
        ES_LOGS ? "" : "ES_LOGS"
      } ${
        ES_LOGS_TOKEN ? "" : "ES_LOGS_TOKEN"
      }, Covisites won't be available in related items.`
    );
  }
} else {
  logger.info(`Accessing Monolog Elastic Search logs on ${ES_LOGS}`);
}

const esClientConfig = {
  auth: { apiKey: ES_LOGS_TOKEN },
  node: ES_LOGS,
};

const client =
  ES_LOGS && ES_LOGS_TOKEN ? new Client(esClientConfig) : undefined;

const queries = LogQueries(client, "log_reports");

export const fetchCovisits = async (doc) => {
  let sourceRoute = getRouteBySource(doc.source);

  // special case for fiches MT
  if (doc.source == SOURCES.SHEET_MT_PAGE) {
    sourceRoute = getRouteBySource(SOURCES.SHEET_MT);
  }

  const path = `${sourceRoute}/${doc.slug}`;
  const links = await queries
    .getCovisitLinks(path)
    .then((covisits) => covisits.links)
    .catch(() => {
      // TODO avoid silent and deal with failure properly
      // console.error(err);
      return undefined;
    });
  if (links?.length > 0) {
    console.log(path, links);
  }
  doc.covisits = links;

  return doc;
};
