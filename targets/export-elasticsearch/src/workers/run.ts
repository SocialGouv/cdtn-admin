import { Worker } from "worker_threads";

export const runWorkerIngester = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./build/workers/ingester.js");
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};
