import { Client } from "@elastic/elasticsearch";
import { logger } from "@socialgouv/cdtn-logger";
import { getRouteBySource, SOURCES } from "@socialgouv/cdtn-sources";

import { context } from "./context";

export const fetchCovisits = async (doc) => {
  const ES_LOGS = context.get("esLogs");
  const ES_LOGS_TOKEN = context.get("esLogsToken");

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
  }

  const esClientConfig = {
    auth: { apiKey: ES_LOGS_TOKEN },
    node: ES_LOGS,
  };

  const client =
    ES_LOGS && ES_LOGS_TOKEN ? new Client(esClientConfig) : undefined;

  let sourceRoute = getRouteBySource(doc.source);

  // special case for fiches MT
  if (doc.source == SOURCES.SHEET_MT_PAGE) {
    sourceRoute = getRouteBySource(SOURCES.SHEET_MT);
  }

  const path = `${sourceRoute}/${doc.slug}`;

  if (client) {
    const query = {
      bool: {
        must: [
          {
            term: {
              reportType: "covisit",
            },
          },
          {
            term: {
              content: path,
            },
          },
        ],
      },
    };

    console.time(`getCovisitLinks-${path}`);
    const result = await client
      .search({ body: { query }, index: "log_reports", size: 30 })
      .catch((err) => {
        // handle Elasticloud error
        if (err?.body?.status) {
          throw err;
        }
        // TODO avoid silent and deal with failure properly
        return undefined;
      });
    const links =
      result && result.body && result.body.hits && result.body.hits.hits
        ? result.body.hits.hits
        : undefined;
    console.timeEnd(`getCovisitLinks-${path}`);
    doc.covisits = links;
  }
  return doc;
};
