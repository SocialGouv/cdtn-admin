import type { GlossaryTerms } from "./types";

export const insertWebComponentGlossary = (
  initialContent: string,
  glossary: GlossaryTerms[]
): string => {
  const index = 0;
  const components: { index: number; value: string }[] = [];
  const result = glossary.reduce((previous, current) => {
    const replacedContent = previous.replace(current.pattern, (term) => {
      const value = createWebComponent(current.definition, term);
      components.push({ index, value });
      return `__${index}__`;
    });
    return replacedContent;
  }, initialContent);

  const final = components.reduce((previous, current) => {
    return previous.replace(`__${current.index}__`, current.value);
  }, result);

  return final;
};

const createWebComponent = (definition: string | null, term: string) => {
  const data = definition
    ? `<webcomponent-tooltip content="${definition}">${term}</webcomponent-tooltip>`
    : `<webcomponent-tooltip-cc>${term}</webcomponent-tooltip-cc>`;
  return data;
};
