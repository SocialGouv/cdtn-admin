import type { GlossaryTerms } from "./types";

export const insertWebComponentGlossary = (
  initialContent: string,
  glossary: GlossaryTerms[]
): string => {
  let index = 0;
  const components: { index: number; value: string }[] = [];
  const result = glossary.reduce((previous, current) => {
    return previous.replace(current.pattern, (term) => {
      const value = createWebComponent(current.definition, term);
      index++;
      components.push({ index, value });
      return `__${index}__`;
    });
  }, initialContent);

  return components.reduce((previous, current) => {
    return previous.replace(`__${current.index}__`, current.value);
  }, result);
};

const createWebComponent = (definition: string | null, term: string) => {
  return definition
    ? `<webcomponent-tooltip content="${definition}">${term}</webcomponent-tooltip>`
    : `<webcomponent-tooltip-cc>${term}</webcomponent-tooltip-cc>`;
};
