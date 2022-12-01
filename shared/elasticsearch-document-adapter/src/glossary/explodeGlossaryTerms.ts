import type { Glossary, Term } from "../types";
import type { GlossaryTerms } from "./types";

const conventionMatchers = [
  "convention collective",
  "conventions collectives",
  "accords de branches",
  "accord de branche",
  "disposition conventionnelle",
  "dispositions conventionnelles",
];

const startWordBreaks = `(?<=^| |\\.|,|'|>)`;
const endWordBreaks = `(?= |\\.|,|'|$|<)`;

const startWebComponentOmit = `(?<!<webcomponent-tooltip(-cc)?>)`;
const endWebComponentOmit = `(?![^<]*</webcomponent-tooltip(-cc)?>)`;

const tagAttributeOmit = `(?<=(^|>)[^><]*)`;

const startTag = `${startWebComponentOmit}${tagAttributeOmit}${startWordBreaks}`;
const endTag = `${endWordBreaks}${endWebComponentOmit}`;

export const explodeGlossaryTerms = (glossary: Glossary): GlossaryTerms[] => {
  const glossaryTerms = glossary.flatMap((term) => explodeTerm(term));

  // we make sure that bigger terms are replaced first
  glossaryTerms.sort((previous, next) => {
    return next.term.length - previous.term.length;
  });

  // we also sure that cc matchers are replaced first
  explodeAgreements().forEach((item) => {
    glossaryTerms.unshift(item);
  });

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
    term: termToReplace,
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
    term: abbreviation,
  }));

const abbreviationPattern = (abbreviation: string) =>
  new RegExp(`${startTag}\\b(${abbreviation})\\b${endTag}`, "g");

const explodeAgreements = (): GlossaryTerms[] =>
  conventionMatchers.map((matcher) => ({
    definition: null,
    pattern: agreementPattern(matcher),
    term: matcher,
  }));

const agreementPattern = (matcher: string) => {
  return new RegExp(`${startTag}(${matcher})${endTag}`, "gi");
};
