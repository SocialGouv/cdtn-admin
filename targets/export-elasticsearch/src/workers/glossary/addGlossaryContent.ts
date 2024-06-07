import { explodeGlossaryTerms } from "./explodeGlossaryTerms";
import { insertWebComponentGlossary } from "./insertWebComponentGlossary";
import { Glossary } from "@socialgouv/cdtn-types";
import { markdownProcessor } from "./markdownProcessor";

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

export async function addGlossaryContentToMarkdown(
  glossary: Glossary,
  markdown?: string | null
): Promise<string> {
  if (!markdown) return "";

  const content = (await markdownProcessor.process(markdown))
    .contents as string;
  return addGlossaryContent(glossary, content);
}
