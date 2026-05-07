import { ingest } from "../ingester";
import { parentPort, workerData } from "worker_threads";
import type { ReferenceValues } from "../controllers/middlewares/export";

const ingester = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const reference: ReferenceValues | undefined = workerData?.reference;
      await ingest(
        process.env.HASURA_GRAPHQL_ENDPOINT,
        process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        process.env.ELASTICSEARCH_URL_PROD,
        process.env.ELASTICSEARCH_TOKEN_INGEST_PROD,
        process.env.ELASTICSEARCH_USER_INGEST_PROD,
        process.env.ELASTICSEARCH_PASSWORD_INGEST_PROD,
        process.env.BRANCH_NAME_SLUG
          ? `cdtn-${process.env.BRANCH_NAME_SLUG}`
          : process.env.ELASTICSEARCH_INDEX_PROD,
        undefined,
        undefined,
        undefined,
        true,
        reference
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
