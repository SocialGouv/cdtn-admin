import { Glossary } from "@socialgouv/cdtn-types";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import {
  addGlossaryContent,
  addGlossaryContentToMarkdown,
} from "./addGlossaryContent";

export type GlossaryWorkerData = {
  glossary: Glossary;
  type: "markdown" | "html";
  content?: string | null;
};

export const addGlossaryContentWorker = async (
  workerData: GlossaryWorkerData
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData,
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

if (!isMainThread) {
  const { glossary, type, content } = workerData as GlossaryWorkerData;
  if (type === "markdown") {
    addGlossaryContentToMarkdown(glossary, content).then((res) => {
      parentPort?.postMessage(res);
    });
  } else if (type === "html") {
    parentPort?.postMessage(addGlossaryContent(glossary, content));
  }
}
