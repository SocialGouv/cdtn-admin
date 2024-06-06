import { Glossary } from "@socialgouv/cdtn-types";
import { Worker } from "worker_threads";
import path from "path";

export type GlossaryWorkerData = {
  glossary: Glossary;
  type: "markdown" | "html";
  content?: string | null;
};

export const addGlossaryContentWorker = async (
  workerData: GlossaryWorkerData
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const packagePath = path.dirname(require.resolve("@shared/utils"));
    const worker = new Worker(
      path.join("../", packagePath, "/glossary/workers/runGlossaryProcess.js"),
      {
        workerData,
      }
    );
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
};
