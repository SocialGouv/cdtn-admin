import { logger } from "@socialgouv/cdtn-logger";

import { context } from "../context";
import type { Glossary } from "../types";
import { explodeGlossaryTerms } from "./explodeGlossaryTerms";
import { insertWebComponentGlossary } from "./insertWebComponentGlossary";

/**
 * addGlossary is a heavy operation that is only neede while dumping for ES
 */

export type AddGlossaryReturnFn = (content: string) => {
  result: string;
  duration: number;
};

export const createGlossaryTransform = (
  glossary: Glossary
): AddGlossaryReturnFn => {
  const DISABLE_GLOSSARY = context.get("disableGlossary") ?? false;

  function addGlossary(content: string): { result: string; duration: number } {
    if (DISABLE_GLOSSARY) {
      return { duration: 0, result: content };
    }
    if (!content) return { duration: 0, result: "" };

    const start = process.hrtime();
    const glossaryTerms = explodeGlossaryTerms(glossary);
    const result = insertWebComponentGlossary(content, glossaryTerms);
    const total = process.hrtime(start);
    return { duration: Math.round(total[1] / 1000000), result };
  }

  return addGlossary;
};
