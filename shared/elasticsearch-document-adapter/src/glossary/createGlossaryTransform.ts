import { context } from "../context";
import { getTimeInMs } from "../time-utils";
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

  glossary.sort((previous, next) => {
    return next.term.length - previous.term.length;
  });
  const glossaryTerms = explodeGlossaryTerms(glossary).map((item) => {
    const definition = item.definition
      ? encodeURIComponent(
          item.definition
            .replace(/'/g, "’")
            .replace("<p>", "")
            .replace("</p>", "")
        )
      : null;
    return {
      ...item,
      definition,
    };
  });

  function addGlossary(content: string): { result: string; duration: number } {
    const start = process.hrtime();
    if (DISABLE_GLOSSARY) {
      return { duration: 0, result: content };
    }
    if (!content) return { duration: 0, result: "" };

    const result = insertWebComponentGlossary(content, glossaryTerms);
    const total = process.hrtime(start);
    return {
      duration: getTimeInMs(total),
      result,
    };
  }

  return addGlossary;
};
