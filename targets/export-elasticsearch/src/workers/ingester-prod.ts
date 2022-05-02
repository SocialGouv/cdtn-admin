import { ingest } from "@shared/elasticsearch-document-adapter";
import { parentPort } from "worker_threads";

const ingester = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      await ingest(
        process.env.CDTN_ADMIN_ENDPOINT,
        process.env.ES_LOGS_PROD,
        process.env.ES_LOGS_TOKEN_PROD,
        process.env.ELASTICSEARCH_URL_PROD,
        process.env.ELASTICSEARCH_TOKEN_INGEST_PROD,
        undefined,
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
