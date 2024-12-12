import { explodeGlossaryTerms } from "./explodeGlossaryTerms";
import { insertWebComponentGlossary } from "./insertWebComponentGlossary";
import { Glossary } from "@socialgouv/cdtn-types";

export const addGlossaryContent = (
  glossary: Glossary,
  content?: string | null
): string => {
  if (!content) return "";

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

  return insertWebComponentGlossary(content, glossaryTerms);
};
