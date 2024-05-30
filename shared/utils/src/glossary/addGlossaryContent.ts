import { explodeGlossaryTerms } from "./explodeGlossaryTerms";
import { insertWebComponentGlossary } from "./insertWebComponentGlossary";
import { Glossary } from "@socialgouv/cdtn-types";

export const addGlossaryContent = async (
  glossary: Glossary,
  content: string
): Promise<string> => {
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

  if (!content) return "";
  return insertWebComponentGlossary(content, glossaryTerms);
};
