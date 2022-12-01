import type { Glossary, Term } from "../types";
import type { GlossaryTerms } from "./types";

const conventionMatchers =
  "[C|c]onventions? [C|c]ollectives?|[A|a]ccords? de [B|b]ranches?|[D|d]ispositions? [C|c]onventionnelles?";

const startWordBreaks = `(?<=^| |\\.|,|'|>)`;
const endWordBreaks = `(?= |\\.|,|'|$|<)`;

const startWebComponentOmit = `(?<!<webcomponent-tooltip(-cc)?>)`;
const endWebComponentOmit = `(?![^<]*</webcomponent-tooltip(-cc)?>)`;

const tagAttributeOmit = `(?<=(^|>)[^><]*)`;

const startTag = `${startWebComponentOmit}${tagAttributeOmit}${startWordBreaks}`;
const endTag = `${endWordBreaks}${endWebComponentOmit}`;

export const explodeGlossaryTerms = (glossary: Glossary): GlossaryTerms[] => {
  // we make sure that bigger terms are replaced first
  glossary.sort((previous, next) => {
    return next.term.length - previous.term.length;
  });

  const glossaryTerms = glossary.flatMap((term) => explodeTerm(term));

  // we also sure that cc matchers are replaced first
  glossaryTerms.unshift(explodeAgreements());

  return glossaryTerms;
};

const explodeTerm = (term: Term): GlossaryTerms[] => {
  const variants = explodeVariants(term);
  return variants.concat(explodeAbbreviations(term));
};

const explodeVariants = ({
  definition,
  term,
  variants = [],
}: Term): GlossaryTerms[] =>
  [term, ...variants].map((termToReplace) => ({
    definition,
    pattern: variantPattern(termToReplace),
  }));

const variantPattern = (term: string) =>
  new RegExp(`${startTag}(${term.split(" ").join("s? ")}s?)${endTag}`, "gi");

const explodeAbbreviations = ({
  abbreviations,
  definition,
}: Term): GlossaryTerms[] =>
  abbreviations.map((abbreviation: string) => ({
    definition,
    pattern: abbreviationPattern(abbreviation),
  }));

const abbreviationPattern = (abbreviation: string) =>
  new RegExp(`${startTag}\\b(${abbreviation})\\b${endTag}`, "g");

const explodeAgreements = (): GlossaryTerms => {
  return {
    definition: null,
    pattern: new RegExp(`${startTag}(${conventionMatchers})${endTag}`, "g"),
  };
};
