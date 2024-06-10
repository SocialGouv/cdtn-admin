import { Client } from "@elastic/elasticsearch";
import {
  createIndex,
  deleteOldIndex,
  documentMapping,
  DOCUMENTS,
  indexDocumentsBatched,
  SUGGESTIONS,
  vectorizeDocument,
  version,
} from "@socialgouv/cdtn-elasticsearch";
import { logger } from "@shared/utils";
import { SOURCES } from "@socialgouv/cdtn-sources";
import pMap from "p-map";

import { cdtnDocumentsGen } from "./cdtnDocuments";
import { context } from "./context";
import { populateSuggestions } from "./suggestion";
import { Environment } from "@socialgouv/cdtn-types";

async function addVector(data: any) {
  const NLP_URL = context.get("nlpUrl");
  if (NLP_URL) {
    if (!data.title) {
      logger.error(`No title for document ${data.source} / ${data.slug}`);
    }
    const title = data.title || "sans titre";
    await vectorizeDocument(title, data.text)
      .then((title_vector: any) => {
        if (title_vector.message) {
          throw new Error(`error fetching message ${data.title}`);
        }
        data.title_vector = title_vector;
      })
      .catch((err: any) => {
        throw new Error(
          `Vectorization failed: ${data.id} (${data.title} - ${err.retryCount} retries)`
        );
      });
  }

  return Promise.resolve(data);
}

// these sources do not need NLP vectorization
const excludeSources = [
  SOURCES.CDT,
  SOURCES.GLOSSARY,
  SOURCES.PREQUALIFIED,
  SOURCES.HIGHLIGHTS,
  SOURCES.SHEET_MT_PAGE,
  SOURCES.VERSIONS,
];

export async function ingest(
  cdtnAdminEndpoint: string | undefined,
  cdtnAdminEndpointSecret: string | undefined,
  esUrl: string | undefined,
  esTokenIngest: string | undefined,
  esIndexPrefix: string | undefined,
  nlpUrl: string | undefined,
  suggestIndexName: string | undefined,
  bufferSize: number | undefined,
  suggestFile: string | undefined,
  disableGlossary: boolean | undefined,
  isProd = false
) {
  context.provide();
  process.env.NLP_URL = nlpUrl; //pour setter la variable d'environment du package elasticsearch...
  await runIngester(
    cdtnAdminEndpoint,
    cdtnAdminEndpointSecret,
    esUrl,
    esTokenIngest,
    esIndexPrefix,
    nlpUrl,
    suggestIndexName,
    bufferSize,
    suggestFile,
    disableGlossary,
    isProd
  );
}

async function runIngester(
  cdtnAdminEndpoint: string | undefined,
  cdtnAdminEndpointSecret: string | undefined,
  esUrl: string | undefined,
  esTokenIngest: string | undefined,
  esIndexPrefix: string | undefined,
  nlpUrl: string | undefined,
  suggestIndexName: string | undefined,
  bufferSize: number | undefined,
  suggestFile: string | undefined,
  disableGlossary: boolean | undefined,
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
  context.set("disableGlossary", disableGlossary);
  context.set("nlpUrl", nlpUrl);
  const ts = Date.now();
  logger.info(`Using cdtn elasticsearch ${ELASTICSEARCH_URL}`);

  if (nlpUrl) {
    logger.info(`Using NLP service to retrieve tf vectors on ${nlpUrl}`);
  } else {
    logger.info(`NLP_URL not defined, semantic search will be disabled.`);
  }

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

    let docs = documents;

    // add NLP vectors
    if (!(excludeSources as string[]).includes(source)) {
      docs = await pMap(documents, addVector, {
        concurrency: 5,
      });
    }

    await indexDocumentsBatched({
      client,
      documents: docs,
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
