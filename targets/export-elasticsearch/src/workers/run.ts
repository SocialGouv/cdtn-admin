import { Worker } from "worker_threads";
import type { ReferenceValues } from "../controllers/middlewares/export";

export const runWorkerIngesterProduction = async (
  reference?: ReferenceValues
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./build/workers/ingester-prod.js", {
      workerData: { reference },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};

export const runWorkerIngesterPreproduction = async (
  reference?: ReferenceValues
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./build/workers/ingester-preprod.js", {
      workerData: { reference },
    });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};
