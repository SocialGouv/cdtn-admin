import { context } from "../context";
import type { Glossary } from "../types";
import { explodeGlossaryTerms } from "./explodeGlossaryTerms";
import { insertWebComponentGlossary } from "./insertWebComponentGlossary";

/**
 * addGlossary is a heavy operation that is only needed while dumping for ES
 */

export type AddGlossaryReturnFn = (content: string) => string;

export const createGlossaryTransform = (
  glossary: Glossary
): AddGlossaryReturnFn => {
  const DISABLE_GLOSSARY = context.get("disableGlossary") ?? false;

  glossary.sort((previous, next) => {
    return next.term.length - previous.term.length;
  });
  const glossaryTerms = explodeGlossaryTerms(glossary).map((item) => {
    const definition = item.definition
      ? encodeURIComponent(item.definition.replace(/'/g, "’"))
      : null;
    return {
      ...item,
      definition,
    };
  });

  function addGlossary(content: string): string {
    if (DISABLE_GLOSSARY) {
      return content;
    }
    if (!content) return "";

    return insertWebComponentGlossary(content, glossaryTerms);
  }

  return addGlossary;
};
