import type { Glossary, Term } from "../types";
import type { GlossaryTerms } from "./types";

const conventionMatchers =
  "[C|c]onventions? [C|c]ollectives?|[A|a]ccords? de [B|b]ranches?|[D|d]ispositions? [C|c]onventionnelles?";

const startWordBreaks = `(?<=^| |\\.|,|'|>|\\()`;
const endWordBreaks = `(?= |\\.|,|'|$|<|\\))`;

const startAnchorOmit = `(?<!<a>|<summary>)`;
const endAnchorOmit = `(?![^<]*</a>|[^<]*</summary>)`;

const tagAttributeOmit = `(?<=(^|>)[^><]*)`;

const startTag = `${startAnchorOmit}${tagAttributeOmit}${startWordBreaks}`;
const endTag = `${endWordBreaks}${endAnchorOmit}`;

export const explodeGlossaryTerms = (glossary: Glossary): GlossaryTerms[] => {
  // we make sure that bigger terms are replaced first
  const glossaryTerms = glossary.flatMap((term) => explodeTerm(term));

  // we also sure that cc matchers are replaced first
  glossaryTerms.unshift(explodeAgreements());

  return glossaryTerms;
};

const escapeRegexSpecialChars = (term: string) => {
  const regexSpecialChars = [
    ".",
    "+",
    "*",
    "?",
    "^",
    "$",
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "|",
  ];
  return regexSpecialChars.reduce((term: string, specialChar: string) => {
    return term.replace(new RegExp(`\\${specialChar}`), `\\${specialChar}`);
  }, term);
};

const explodeTerm = (term: Term): GlossaryTerms[] => {
  term = {
    ...term,
    term: escapeRegexSpecialChars(term.term),
  };
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

const regexPlural = (term: string) => `${term.split(" ").join("s? ")}s?`;
const regexCapital = (term: string) => {
  return term.split(" ").reduce((regexString, word) => {
    const firstChar = word.slice(0, 1);
    const firstCharLow = firstChar.toLowerCase();
    const firstCharUp = firstChar.toUpperCase();
    const firstCharRegex =
      firstCharLow !== firstCharUp
        ? `[${firstCharLow}|${firstCharUp}]`
        : firstCharLow;
    return `${
      regexString ? `${regexString} ` : ""
    }${firstCharRegex}${word.slice(1)}`;
  }, "");
};

const variantPattern = (term: string) => {
  term = regexPlural(term);
  term = regexCapital(term);
  return new RegExp(`${startTag}(${term})${endTag}`, "g");
};

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
