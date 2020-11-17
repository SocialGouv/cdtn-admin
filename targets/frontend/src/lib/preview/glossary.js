const conventionMatchers = [
  "convention collective",
  "conventions collectives",
  "accords de branches",
  "accord de branche",
  "disposition conventionnelle",
  "dispositions conventionnelles",
];

// we cannot use \b word boundary since \w does not match diacritics
// So we do a kind of \b equivalent.
// the main différence is that matched pattern can include a whitespace as first char
const frDiacritics = "àâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ";
const wordBoundaryStart = `(?:^|[^_/\\w${frDiacritics}-])`;
const wordBoundaryEnd = `(?![\\w${frDiacritics}])`;

const startTag = `(?<=>[^><]*)`;
const endTag = `(?=[^<]*</)`;

export function addGlossary(entries, htmlContent) {
  if (!htmlContent) return "";

  let idHtmlContent = htmlContent;

  let glossary = [];
  entries.forEach(
    ({
      abbreviations: abbreviationsRaw,
      definition,
      term,
      variants: variantsRaw,
    }) => {
      const abbreviations = JSON.parse(abbreviationsRaw);
      const variants = JSON.parse(variantsRaw);

      glossary = glossary.concat(
        [term, ...variants].map((term) => ({
          definition,
          pattern: new RegExp(
            `${startTag}${wordBoundaryStart}(${term})${wordBoundaryEnd}${endTag}`,
            "gi"
          ),
          term,
        }))
      );

      if (abbreviations.length) {
        for (const word of abbreviations) {
          glossary.push({
            definition,
            pattern: new RegExp(`${startTag}\\b(${word})\\b${endTag}`, "g"),
            term: word,
          });
        }
      }
    }
  );

  // we make sure that bigger terms are replaced first
  glossary.sort((previous, next) => {
    return next.term.length - previous.term.length;
  });

  // we also sure that cc matchers are replaced first
  conventionMatchers.forEach((matcher) => {
    glossary.unshift({
      definition: false,
      pattern: new RegExp(`${startTag}(${matcher})${endTag}`, "gi"),
      term: matcher,
    });
  });

  const idToWebComponent = new Map();

  glossary.forEach(({ definition, pattern, term }, index) => {
    // while we loop, we replace the matches with an id to prevent nested matches
    idHtmlContent = idHtmlContent.replace(pattern, function (
      match // contains the matching term with the word boundaries
    ) {
      const id = "__tt__" + index;
      const webComponent = definition
        ? `<webcomponent-tooltip content="${encodeURIComponent(
            definition.replace(/'/g, "’").replace("<p>", "").replace("</p>", "")
          )}">${term}</webcomponent-tooltip>`
        : `<webcomponent-tooltip-cc>${term}</webcomponent-tooltip-cc>`;
      idToWebComponent.set(id, webComponent);
      return match.replace(new RegExp(term), id);
    });
  });

  // In the end, we replace the id with its related component
  let finalContent = idHtmlContent;
  idToWebComponent.forEach((webComponent, id) => {
    // make sure we don't match larger numbers
    finalContent = finalContent.replace(
      new RegExp(`${id}([^1-9])`, "g"),
      `${webComponent}$1`
    );
  });

  return finalContent;
}
