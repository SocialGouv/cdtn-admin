import { ingest } from "@shared/elasticsearch-document-adapter";
import { parentPort } from "worker_threads";

const ingester = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    console.log(`BRANCH_NAME_SLUG : ${process.env.BRANCH_NAME_SLUG}`);
    console.log(
      `Use index : ${
        process.env.BRANCH_NAME_SLUG ?? process.env.ELASTICSEARCH_INDEX_PROD
      }`
    );
    try {
      await ingest(
        process.env.HASURA_GRAPHQL_ENDPOINT,
        process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        process.env.ES_LOGS_PREPROD,
        process.env.ES_LOGS_TOKEN_PREPROD,
        process.env.ELASTICSEARCH_URL_PREPROD,
        process.env.ELASTICSEARCH_TOKEN_INGEST_PREPROD,
        process.env.BRANCH_NAME_SLUG ?? process.env.ELASTICSEARCH_INDEX_PREPROD,
        process.env.NLP_URL,
        undefined,
        undefined,
        undefined,
        false
      );
      resolve("Export elasticsearch completed successfully");
    } catch (error: unknown) {
      reject(error);
    }
  });
};

(async () => {
  const result = await ingester();
  if (parentPort) {
    parentPort.postMessage(result);
  }
})();
