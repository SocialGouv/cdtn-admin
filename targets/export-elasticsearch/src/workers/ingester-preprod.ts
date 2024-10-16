import { ingest } from "../ingester";
import { parentPort } from "worker_threads";

const ingester = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      await ingest(
        process.env.HASURA_GRAPHQL_ENDPOINT,
        process.env.HASURA_GRAPHQL_ADMIN_SECRET,
        process.env.ELASTICSEARCH_URL_PREPROD,
        process.env.ELASTICSEARCH_TOKEN_INGEST_PREPROD,
        process.env.BRANCH_NAME_SLUG
          ? `cdtn-${process.env.BRANCH_NAME_SLUG}`
          : process.env.ELASTICSEARCH_INDEX_PREPROD,
        undefined,
        undefined,
        undefined
      );
      resolve("Export elasticsearch completed successfully");
    } catch (error: unknown) {
      console.error("Failure during ingest", error);
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
