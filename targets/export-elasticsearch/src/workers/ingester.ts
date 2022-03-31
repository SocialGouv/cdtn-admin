import { injest } from "@shared/elasticsearch-document-adapter";
import { parentPort } from "worker_threads";

const ingester = async (): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      await injest();
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
