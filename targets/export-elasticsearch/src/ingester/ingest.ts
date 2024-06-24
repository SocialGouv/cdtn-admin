import { Client } from "@elastic/elasticsearch";
import {
  createIndex,
  deleteOldIndex,
  documentMapping,
  DOCUMENTS,
  indexDocumentsBatched,
  SUGGESTIONS,
  version,
} from "@socialgouv/cdtn-elasticsearch";
import { logger } from "@shared/utils";

import { cdtnDocumentsGen } from "./cdtnDocuments";
import { context } from "./context";
import { populateSuggestions } from "./suggestion";

export async function ingest(
  cdtnAdminEndpoint: string | undefined,
  cdtnAdminEndpointSecret: string | undefined,
  esUrl: string | undefined,
  esTokenIngest: string | undefined,
  esIndexPrefix: string | undefined,
  suggestIndexName: string | undefined,
  bufferSize: number | undefined,
  suggestFile: string | undefined,
  isProd = false
) {
  context.provide();
  await runIngester(
    cdtnAdminEndpoint,
    cdtnAdminEndpointSecret,
    esUrl,
    esTokenIngest,
    esIndexPrefix,
    suggestIndexName,
    bufferSize,
    suggestFile,
    isProd
  );
}

async function runIngester(
  cdtnAdminEndpoint: string | undefined,
  cdtnAdminEndpointSecret: string | undefined,
  esUrl: string | undefined,
  esTokenIngest: string | undefined,
  esIndexPrefix: string | undefined,
  suggestIndexName: string | undefined,
  bufferSize: number | undefined,
  suggestFile: string | undefined,
  isProd: boolean
) {
  const ES_INDEX_PREFIX = esIndexPrefix ?? "cdtn";

  const DOCUMENT_INDEX_NAME = `${ES_INDEX_PREFIX}_${DOCUMENTS}`;
  const SUGGEST_INDEX_NAME = `${ES_INDEX_PREFIX}_${SUGGESTIONS}`;

  const ELASTICSEARCH_URL = esUrl ?? "http://localhost:9200";

  const client = new Client(
    Object.assign(
      {
        node: ELASTICSEARCH_URL,
      },
      esTokenIngest
        ? {
            auth: {
              apiKey: esTokenIngest,
            },
          }
        : {}
    )
  );

  context.set("cdtnAdminEndpoint", cdtnAdminEndpoint);
  context.set("cdtnAdminEndpointSecret", cdtnAdminEndpointSecret);
  context.set("esUrl", esUrl);
  context.set("suggestIndexName", suggestIndexName);
  context.set("bufferSize", bufferSize);
  context.set("suggestFile", suggestFile);
  const ts = Date.now();
  logger.info(`Using cdtn elasticsearch ${ELASTICSEARCH_URL}`);

  await version({ client });

  logger.info(`Creating index ${DOCUMENT_INDEX_NAME}-${ts}`);
  // Indexing documents/search data
  await createIndex({
    client,
    indexName: `${DOCUMENT_INDEX_NAME}-${ts}`,
    mappings: documentMapping,
  });
  const t0 = Date.now();
  const updateDocs = async (source: string, documents: unknown[]) => {
    logger.info(`› ${source}... ${documents.length} items`);

    await indexDocumentsBatched({
      client,
      documents,
      indexName: `${DOCUMENT_INDEX_NAME}-${ts}`,
      size: 800,
    });
  };
  await cdtnDocumentsGen(updateDocs, isProd);

  logger.info(`done in ${(Date.now() - t0) / 1000} s`);

  // Indexing Suggestions
  await populateSuggestions(client, `${SUGGEST_INDEX_NAME}-${ts}`);

  // Creating aliases
  await client.indices.updateAliases({
    body: {
      actions: [
        {
          remove: {
            alias: `${DOCUMENT_INDEX_NAME}`,
            index: `${DOCUMENT_INDEX_NAME}-*`,
          },
        },
        {
          remove: {
            alias: `${SUGGEST_INDEX_NAME}`,
            index: `${SUGGEST_INDEX_NAME}-*`,
          },
        },

        {
          add: {
            alias: `${DOCUMENT_INDEX_NAME}`,
            index: `${DOCUMENT_INDEX_NAME}-${ts}`,
          },
        },
        {
          add: {
            alias: `${SUGGEST_INDEX_NAME}`,
            index: `${SUGGEST_INDEX_NAME}-${ts}`,
          },
        },
      ],
    },
  });

  const patterns = [DOCUMENT_INDEX_NAME, SUGGEST_INDEX_NAME];

  await deleteOldIndex({ client, patterns, timestamp: ts });
}
