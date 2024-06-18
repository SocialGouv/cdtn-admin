import { GlossaryTerms, Glossary, Term } from "@socialgouv/cdtn-types";

const conventionMatchers =
  "[Cc]onventions? [Cc]ollectives?|[Aa]ccords? de [Bb]ranches?|[Dd]ispositions? [Cc]onventionnelles?";

const startWordBreaks = `(?<=^| |\\.|,|'|>|\\()`;
const endWordBreaks = `(?= |\\.|,|'|$|<|\\))`;

const startAnchorOmit = `(?<!<span class="(?:sub-)?title">[^<]*)`;
const endAnchorOmit = `(?![^<]*(?:</a>|</summary>|</strong>.*</summary>|</h[1-6]>))`;

const tagAttributeOmit = `(?<=(^|>)[^><]*)`;

const startTag = `${tagAttributeOmit}${startAnchorOmit}${startWordBreaks}`;
const endTag = `${endWordBreaks}${endAnchorOmit}`;

export const explodeGlossaryTerms = (glossary: Glossary): GlossaryTerms[] => {
  // we make sure that bigger terms are replaced first
  const glossaryTerms = glossary.flatMap((term) => explodeTerm(term));

  // we also sure that cc matchers are replaced first
  glossaryTerms.unshift(explodeAgreements());

  return glossaryTerms;
};
const regexSpecialChars = ["(", ")"];
const escapeRegexSpecialChars = (term: string) => {
  return regexSpecialChars.reduce(
    (escapedTerm: string, specialChar: string) => {
      return escapedTerm.replace(specialChar, `\\${specialChar}`);
    },
    term
  );
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
        ? `[${firstCharLow}${firstCharUp}]`
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
