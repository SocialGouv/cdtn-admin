import type { GlossaryTerms } from "./types";

export const insertWebComponentGlossary = (
  initialContent: string,
  glossary: GlossaryTerms[]
): string => {
  const result = glossary.reduce((previous, current) => {
    const replacedContent = previous.replace(current.pattern, (term) => {
      return createWebComponent(current.definition, term);
    });
    return replacedContent;
  }, initialContent);

  return result;
};

const createWebComponent = (definition: string | null, term: string) => {
  return definition
    ? `<webcomponent-tooltip content="${encodeURIComponent(
        definition.replace(/'/g, "’").replace("<p>", "").replace("</p>", "")
      )}">${term}</webcomponent-tooltip>`
    : `<webcomponent-tooltip-cc>${term}</webcomponent-tooltip-cc>`;
};
