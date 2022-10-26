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

export const explodeGlossaryTerms = (
  glossary: Glossary,
  isMarkdown: boolean
): GlossaryTerms[] => {
  const glossaryTerms = glossary.flatMap((term) =>
    explodeTerm(term, isMarkdown)
  );

  // we make sure that bigger terms are replaced first
  glossaryTerms.sort((previous, next) => {
    return next.term.length - previous.term.length;
  });

  // we also sure that cc matchers are replaced first
  explodeAgreements(isMarkdown).forEach((item) => {
    glossaryTerms.unshift(item);
  });

  return glossaryTerms;
};

const explodeTerm = (term: Term, isMarkdown: boolean): GlossaryTerms[] =>
  explodeVariants(term, isMarkdown).concat(
    explodeAbbreviations(term, isMarkdown)
  );

const explodeVariants = (
  { definition, term, variants = [] }: Term,
  isMarkdown: boolean
): GlossaryTerms[] =>
  [term, ...variants].map((termToReplace) => ({
    definition,
    pattern: variantPattern(termToReplace, isMarkdown),
    term: termToReplace,
  }));

const variantPattern = (term: string, isMarkdown: boolean) =>
  new RegExp(
    isMarkdown
      ? `(${term})` // wordBoundaryStart ?
      : `${startTag}${wordBoundaryStart}(${term})${wordBoundaryEnd}${endTag}`,
    "gi"
  );

const explodeAbbreviations = (
  { abbreviations, definition }: Term,
  isMarkdown: boolean
): GlossaryTerms[] =>
  abbreviations.map((abbreviation: string) => ({
    definition,
    pattern: abbreviationPattern(abbreviation, isMarkdown),
    term: abbreviation,
  }));

const abbreviationPattern = (abbreviation: string, isMarkdown: boolean) =>
  new RegExp(
    isMarkdown
      ? `\\b(${abbreviation})\\b`
      : `${startTag}\\b(${abbreviation})\\b${endTag}`,
    "gi"
  );

const explodeAgreements = (isMarkdown: boolean): GlossaryTerms[] =>
  conventionMatchers.map((matcher) => ({
    definition: null,
    pattern: agreementPattern(matcher, isMarkdown),
    term: matcher,
  }));

const agreementPattern = (matcher: string, isMarkdown: boolean) =>
  new RegExp(
    isMarkdown ? `(${matcher})` : `${startTag}(${matcher})${endTag}`,
    "gi"
  );
