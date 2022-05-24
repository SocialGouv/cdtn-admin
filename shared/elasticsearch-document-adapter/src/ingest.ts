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
  //@ts-expect-error
} from "@socialgouv/cdtn-elasticsearch";
import { logger } from "@socialgouv/cdtn-logger";
import { SOURCES } from "@socialgouv/cdtn-sources";
import pMap from "p-map";
import PQueue from "p-queue";

import { cdtnDocumentsGen } from "./cdtnDocuments";
import { context } from "./context";
import { fetchCovisits } from "./monolog";
import { populateSuggestions } from "./suggestion";

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
  esLogs: string | undefined,
  esLogsToken: string | undefined,
  esUrl: string | undefined,
  esTokenIngest: string | undefined,
  esIndexPrefix: string | undefined,
  nlpUrl: string | undefined,
  suggestIndexName: string | undefined,
  bufferSize: number | undefined,
  suggestFile: string | undefined,
  disableGlossary: boolean | undefined
) {
  context.provide();
  process.env.NLP_URL = nlpUrl; //pour setter la variable d'environment du package elasticsearch...
  await runIngester(
    cdtnAdminEndpoint,
    esLogs,
    esLogsToken,
    esUrl,
    esTokenIngest,
    esIndexPrefix,
    nlpUrl,
    suggestIndexName,
    bufferSize,
    suggestFile,
    disableGlossary
  );
}

async function runIngester(
  cdtnAdminEndpoint: string | undefined,
  esLogs: string | undefined,
  esLogsToken: string | undefined,
  esUrl: string | undefined,
  esTokenIngest: string | undefined,
  esIndexPrefix: string | undefined,
  nlpUrl: string | undefined,
  suggestIndexName: string | undefined,
  bufferSize: number | undefined,
  suggestFile: string | undefined,
  disableGlossary: boolean | undefined
) {
  const ES_INDEX_PREFIX = esIndexPrefix || "cdtn";

  const DOCUMENT_INDEX_NAME = `${ES_INDEX_PREFIX}_${DOCUMENTS}`;
  const SUGGEST_INDEX_NAME = `${ES_INDEX_PREFIX}_${SUGGESTIONS}`;

  const ELASTICSEARCH_URL = esUrl || "http://localhost:9200";

  const esClientConfig = {
    auth: { apiKey: esTokenIngest },
    node: `${ELASTICSEARCH_URL}`,
  };

  const client = new Client(esClientConfig as unknown as any);
  context.set("cdtnAdminEndpoint", cdtnAdminEndpoint);
  context.set("esLogs", esLogs);
  context.set("esLogsToken", esLogsToken);
  context.set("esUrl", esUrl);
  context.set("suggestIndexName", suggestIndexName);
  context.set("bufferSize", bufferSize);
  context.set("suggestFile", suggestFile);
  context.set("disableGlossary", disableGlossary);
  context.set("nlpUrl", nlpUrl);
  const ts = Date.now();
  logger.info(`using cdtn elasticsearch ${ELASTICSEARCH_URL}`);

  if (nlpUrl) {
    logger.info(`Using NLP service to retrieve tf vectors on ${nlpUrl}`);
  } else {
    logger.info(`NLP_URL not defined, semantic search will be disabled.`);
  }

  await version({ client });

  // Indexing documents/search data
  await createIndex({
    client,
    indexName: `${DOCUMENT_INDEX_NAME}-${ts}`,
    mappings: documentMapping,
  });

  const t0 = Date.now();

  const monologQueue = new PQueue({ concurrency: 20 });

  for await (const { source, documents } of cdtnDocumentsGen()) {
    logger.info(`› ${source}... ${documents.length} items`);

    // add covisits using pQueue (there is a plan to change this : see #2915)
    // let covisitDocuments = await pMap(documents, fetchCovisits, {
    //   concurrency: 20,
    // });
    const pDocs = documents.map(async (doc: any) =>
      monologQueue.add(async () => fetchCovisits(doc))
    );
    let covisitDocuments = await Promise.all(pDocs);

    // add NLP vectors
    if (!excludeSources.includes(source as unknown as any)) {
      covisitDocuments = await pMap(covisitDocuments, addVector, {
        concurrency: 5,
      });
    }
    await indexDocumentsBatched({
      client,
      documents: covisitDocuments,
      indexName: `${DOCUMENT_INDEX_NAME}-${ts}`,
      size: 1000,
    });
  }

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
