import type { Glossary } from "../types";
import { explodeGlossaryTerms } from "./explodeGlossaryTerms";
import { insertWebComponentGlossary } from "./insertWebComponentGlossary";

/**
 * addGlossary is a heavy operation that is only neede while dumping for ES
 */
const DISABLE_GLOSSARY = process.env.DISABLE_GLOSSARY ?? false;

type ReturnFn = (content: string, isMarkdown?: boolean) => string;

export const createGlossaryTransform = (glossary: Glossary): ReturnFn => {
  function addGlossary(content: string, isMarkdown?: boolean): string {
    if (DISABLE_GLOSSARY) {
      return content;
    }
    if (!content) return "";

    const glossaryTerms = explodeGlossaryTerms(glossary, isMarkdown ?? false);
    return insertWebComponentGlossary(content, glossaryTerms);
  }

  return addGlossary;
};
