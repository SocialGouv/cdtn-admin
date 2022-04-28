import { ingest } from "@shared/elasticsearch-document-adapter";
import { parentPort } from "worker_threads";

const ingester = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      await ingest(
        process.env.CDTN_ADMIN_ENDPOINT_PREPROD,
        process.env.ES_LOGS_PREPROD,
        process.env.ES_LOGS_TOKEN_PREPROD,
        process.env.ELASTICSEARCH_URL_PREPROD,
        process.env.ELASTICSEARCH_TOKEN_INGEST_PREPROD,
        undefined,
        process.env.NLP_URL_PREPROD,
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
