import { Glossary } from "@socialgouv/cdtn-types";
import { isMainThread, parentPort, Worker, workerData } from "worker_threads";
import { addGlossaryContent } from "./addGlossaryContent";

export interface GlossaryWorkerData {
  glossary: Glossary;
  content: string;
}

export function addGlossaryContentWorker(
  glossaryWorkerData: GlossaryWorkerData
): Promise<string> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, {
      workerData: glossaryWorkerData,
    });
    worker.on("message", resolve);
    worker.on("error", (error) => {
      console.error("[addGlossaryContentWorker] - error", error);
      reject(error);
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        console.error(
          `[addGlossaryContentWorker] - Worker stopped with exit code ${code}`
        );
        reject(`Worker stopped with exit code ${code}`);
      }
    });
  });
}

if (!isMainThread) {
  const { glossary, content }: GlossaryWorkerData = workerData;
  parentPort?.postMessage(addGlossaryContent(glossary, content));
}
