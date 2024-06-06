import { Glossary } from "@socialgouv/cdtn-types";
import { Worker } from "node:worker_threads";
import url from "node:url";
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
    console.log("__dirname:", __dirname);
    console.log("packagespath:", packagePath);
    console.log(
      "url:",
      new url.URL("./runGlossaryProcess.js", import.meta.url)
    );

    const worker = new Worker(
      new url.URL("./runGlossaryProcess.js", import.meta.url),
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
