import {
  addGlossaryContent,
  addGlossaryContentToMarkdown,
} from "../addGlossaryContent";
import { parentPort, workerData } from "node:worker_threads";
import { GlossaryWorkerData } from "./launchWorker";

export const runGlossaryProcess = async () => {
  const { glossary, type, content } = workerData as GlossaryWorkerData;
  let result = "";
  if (type === "markdown") {
    result = await addGlossaryContentToMarkdown(glossary, content);
  } else if (type === "html") {
    result = addGlossaryContent(glossary, content);
  }
  parentPort?.postMessage(result);
};

runGlossaryProcess();
