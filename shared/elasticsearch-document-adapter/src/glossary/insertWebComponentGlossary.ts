import type { GlossaryTerms } from "./types";

export const insertWebComponentGlossary = (
  initialContent: string,
  glossary: GlossaryTerms[]
): string => {
  // Replace all matching terms with an id and store associated web component
  const idToWebComponent = new Map<string, string>();
  let finalContent = glossary.reduce((previous, current, index) => {
    const id = `__tt__${index}__`;
    const { content, hasMatched } = replaceById(previous, current, id);
    if (hasMatched) {
      idToWebComponent.set(id, createWebComponent(current));
    }
    return content;
  }, initialContent);

  // In the end, we replace the id with its related component
  idToWebComponent.forEach((webComponent, id) => {
    // make sure we don't match larger numbers
    finalContent = finalContent.replace(new RegExp(id, "g"), `${webComponent}`);
  });

  return finalContent;
};

const replaceById = (
  content: string,
  { pattern, term }: GlossaryTerms,
  id: string
): { content: string; hasMatched: boolean } =>
  pattern.test(content)
    ? {
        content: content.replace(pattern, (matchingTerm) =>
          matchingTerm.replace(new RegExp(term), id)
        ),
        hasMatched: true,
      }
    : { content, hasMatched: false };

const createWebComponent = ({ definition, term }: GlossaryTerms) =>
  definition
    ? `<webcomponent-tooltip content="${encodeURIComponent(
        definition.replace(/'/g, "’").replace("<p>", "").replace("</p>", "")
      )}">${term}</webcomponent-tooltip>`
    : `<webcomponent-tooltip-cc>${term}</webcomponent-tooltip-cc>`;
