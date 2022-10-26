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

// we cannot use \b word boundary since \w does not match diacritics
// So we do a kind of \b equivalent.
// the main différence is that matched pattern can include a whitespace as first char
const frDiacritics = "àâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ";
const wordBoundaryStart = `(?:^|[^_/\\w${frDiacritics}-])`;
const wordBoundaryEnd = `(?![\\w${frDiacritics}])`;

const startTag = `(?<=>[^><]*)`;
const endTag = `(?=[^<]*</)`;

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

const explodeTerm = (term: Term): GlossaryTerms[] =>
  explodeVariants(term).concat(explodeAbbreviations(term));

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
  new RegExp(
    `${startTag}${wordBoundaryStart}(${term})${wordBoundaryEnd}${endTag}`,
    "gi"
  );

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
  new RegExp(`${startTag}\\b(${abbreviation})\\b${endTag}`, "gi");

const explodeAgreements = (): GlossaryTerms[] =>
  conventionMatchers.map((matcher) => ({
    definition: null,
    pattern: agreementPattern(matcher),
    term: matcher,
  }));

const agreementPattern = (matcher: string) =>
  new RegExp(`${startTag}(${matcher})${endTag}`, "gi");
