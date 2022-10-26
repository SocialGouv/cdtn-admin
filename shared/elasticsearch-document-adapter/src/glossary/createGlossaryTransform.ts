import { context } from "../context";
import type { Glossary } from "../types";
import { explodeGlossaryTerms } from "./explodeGlossaryTerms";
import { insertWebComponentGlossary } from "./insertWebComponentGlossary";

/**
 * addGlossary is a heavy operation that is only neede while dumping for ES
 */

type ReturnFn = (content: string, isMarkdown?: boolean) => string;

export const createGlossaryTransform = (glossary: Glossary): ReturnFn => {
  const DISABLE_GLOSSARY = context.get("disableGlossary") ?? false;

  function addGlossary(content: string): string {
    if (DISABLE_GLOSSARY) {
      return content;
    }
    if (!content) return "";

    const glossaryTerms = explodeGlossaryTerms(glossary);
    return insertWebComponentGlossary(content, glossaryTerms);
  }

  return addGlossary;
};
