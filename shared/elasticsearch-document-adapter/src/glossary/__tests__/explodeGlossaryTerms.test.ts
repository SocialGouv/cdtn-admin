import { explodeGlossaryTerms } from "../explodeGlossaryTerms";

const glossaryWithVariantsAndAbbreviations = [
  {
    abbreviations: ["ABR", "ABRO"],
    definition: "Texte qui ne s’applique plus.",
    term: "Abrogé",
    variants: ["Abrogée", "Abrogés", "Abrogées"],
  },
];

describe("Explode glossary terms", () => {
  describe("Explode glossary terms for HTML content with HTML pattern", () => {
    const glossary = explodeGlossaryTerms(
      glossaryWithVariantsAndAbbreviations,
      false
    );

    it("should contains agreements first with HTML pattern", () => {
      expect(glossary[0]).toEqual({
        definition: null,
        pattern: /(?<=>[^><]*)(dispositions conventionnelles)(?=[^<]*<\/)/gi,
        term: "dispositions conventionnelles",
      });
    });

    it("should explode the glossary with abbreviations and variants", () => {
      expect(glossary.filter((item) => item.definition)).toEqual([
        {
          definition: "Texte qui ne s’applique plus.",
          pattern:
            /(?<=>[^><]*)(?:^|[^_/\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ-])(Abrogées)(?![\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ])(?=[^<]*<\/)/gi,
          term: "Abrogées",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern:
            /(?<=>[^><]*)(?:^|[^_/\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ-])(Abrogée)(?![\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ])(?=[^<]*<\/)/gi,
          term: "Abrogée",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern:
            /(?<=>[^><]*)(?:^|[^_/\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ-])(Abrogés)(?![\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ])(?=[^<]*<\/)/gi,
          term: "Abrogés",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern:
            /(?<=>[^><]*)(?:^|[^_/\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ-])(Abrogé)(?![\wàâäçéèêëïîôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŸŒÆ])(?=[^<]*<\/)/gi,
          term: "Abrogé",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /(?<=>[^><]*)\b(ABRO)\b(?=[^<]*<\/)/gi,
          term: "ABRO",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /(?<=>[^><]*)\b(ABR)\b(?=[^<]*<\/)/gi,
          term: "ABR",
        },
      ]);
    });
  });

  describe("Explode glossary terms for Markdown content", () => {
    const glossary = explodeGlossaryTerms(
      glossaryWithVariantsAndAbbreviations,
      true
    );

    it("should contains agreements first with markdown pattern", () => {
      expect(glossary[0]).toEqual({
        definition: null,
        pattern: /(dispositions conventionnelles)/gi,
        term: "dispositions conventionnelles",
      });
    });

    it("should explode the glossary with abbreviations and variants with markdown pattern", () => {
      expect(glossary.filter((item) => item.definition)).toEqual([
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /Abrogées/gi,
          term: "Abrogées",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /Abrogée/gi,
          term: "Abrogée",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /Abrogés/gi,
          term: "Abrogés",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /Abrogé/gi,
          term: "Abrogé",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /\b(ABRO)\b/gi,
          term: "ABRO",
        },
        {
          definition: "Texte qui ne s’applique plus.",
          pattern: /\b(ABR)\b/gi,
          term: "ABR",
        },
      ]);
    });
  });
});
