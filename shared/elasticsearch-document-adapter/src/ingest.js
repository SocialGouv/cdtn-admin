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
import { SOURCES } from "@socialgouv/cdtn-sources";
import pMap from "p-map";

import { cdtnDocumentsGen } from "./cdtnDocuments";
import { fetchCovisits } from "./monolog";
import { populateSuggestions } from "./suggestion";

const ES_INDEX_PREFIX = process.env.ES_INDEX_PREFIX || "cdtn";

const DOCUMENT_INDEX_NAME = `${ES_INDEX_PREFIX}_${DOCUMENTS}`;
const SUGGEST_INDEX_NAME = `${ES_INDEX_PREFIX}_${SUGGESTIONS}`;

const ELASTICSEARCH_URL =
  process.env.ELASTICSEARCH_URL || "http://localhost:9200";

const NLP_URL = process.env.NLP_URL;

const esClientConfig = {
  auth: { apiKey: process.env.ELASTICSEARCH_TOKEN_INGEST },
  node: `${ELASTICSEARCH_URL}`,
};

const client = new Client(esClientConfig);

async function addVector(data) {
  console.log(`---- ADD VECTOR ${NLP_URL} ----`);
  if (NLP_URL) {
    if (!data.title) {
      console.error(`No title for document ${data.source} / ${data.slug}`);
    }
    const title = data.title || "sans titre";
    await vectorizeDocument(title, data.text)
      .then((title_vector) => {
        if (title_vector.message) {
          throw new Error(`error fetching message ${data.title}`);
        }
        data.title_vector = title_vector;
      })
      .catch((err) => {
        console.error("Vectorization failed", err);
        console.error(
          `Vectorization failed: ${data.title} (${err.retryCount} times)`
        );
        throw new Error(
          `Vectorization failed: ${data.title} (${err.retryCount} times)`
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

export async function injest() {
  const ts = Date.now();
  console.log(`using cdtn elasticsearch ${process.env.ELASTICSEARCH_URL}`);

  if (NLP_URL) {
    console.log(`Using NLP service to retrieve tf vectors on ${NLP_URL}`);
  } else {
    console.log(`NLP_URL not defined, semantic search will be disabled.`);
  }

  await version({ client });

  // Indexing documents/search data
  await createIndex({
    client,
    indexName: `${DOCUMENT_INDEX_NAME}-${ts}`,
    mappings: documentMapping,
  });

  const t0 = Date.now();
  for await (const { source, documents } of cdtnDocumentsGen()) {
    console.log(`› ${source}... ${documents.length} items`);

    // add covisits using pQueue (there is a plan to change this : see #2915)
    console.time("fetchCovisits");
    let covisitDocuments = await pMap(documents, fetchCovisits, {
      concurrency: 20,
    });
    console.timeEnd("fetchCovisits");
    // add NLP vectors
    if (!excludeSources.includes(source)) {
      console.time("addVector");
      covisitDocuments = await pMap(covisitDocuments, addVector, {
        concurrency: 3,
      });
      console.timeEnd("addVector");
      console.log(`finished vectorize ${source} documents`);
    }
    await indexDocumentsBatched({
      client,
      documents: covisitDocuments,
      indexName: `${DOCUMENT_INDEX_NAME}-${ts}`,
      size: 1000,
    });
  }

  console.log(`done in ${(Date.now() - t0) / 1000} s`);

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
