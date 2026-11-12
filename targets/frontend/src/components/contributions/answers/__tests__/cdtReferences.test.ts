import {
  buildCdtReferenceItems,
  getCdtReferencesMode,
  pruneSelection,
} from "../cdtReferences";

describe("cdtReferences", () => {
  describe("buildCdtReferenceItems", () => {
    it("construit le titre et l'URL comme à la publication", () => {
      const items = buildCdtReferenceItems({
        legiReferences: [{ legiArticle: { label: "L3141-1" } }],
        otherReferences: [{ label: "Circulaire", url: "https://exemple.fr/c" }],
      });
      expect(items).toEqual([
        {
          type: "legi",
          label: "Article L3141-1 du code du travail",
          url: "https://code.travail.gouv.fr/code-du-travail/l3141-1",
        },
        {
          type: "other",
          label: "Circulaire",
          url: "https://exemple.fr/c",
        },
      ]);
    });

    it("ignore une autre référence sans lien (non identifiable)", () => {
      const items = buildCdtReferenceItems({
        legiReferences: [],
        otherReferences: [
          { label: "Sans lien", url: "" },
          { label: "Null", url: null },
        ],
      });
      expect(items).toEqual([]);
    });

    it("retire les doublons d'URL", () => {
      const items = buildCdtReferenceItems({
        legiReferences: [],
        otherReferences: [
          { label: "A", url: "https://x" },
          { label: "B", url: "https://x" },
        ],
      });
      expect(items).toHaveLength(1);
    });

    it("retourne une liste vide sans réponse générique", () => {
      expect(buildCdtReferenceItems(undefined)).toEqual([]);
    });
  });

  describe("getCdtReferencesMode", () => {
    it.each([
      ["NOTHING", "readonly"],
      ["CDT", "readonly"],
      ["UNFAVOURABLE", "readonly"],
      ["ANSWER", "selectable"],
      ["UNKNOWN", "none"],
      ["SP", "none"],
      [null, "none"],
    ])("%s → %s", (type, mode) => {
      expect(getCdtReferencesMode(type as any, false)).toBe(mode);
    });

    it("n'affiche rien sur la réponse générique", () => {
      expect(getCdtReferencesMode("ANSWER", true)).toBe("none");
    });
  });

  describe("pruneSelection", () => {
    const items = [
      { type: "legi" as const, label: "A", url: "https://a" },
      { type: "other" as const, label: "B", url: "https://b" },
    ];
    it("retire les références qui n'existent plus", () => {
      expect(pruneSelection(["https://a", "https://supprimee"], items)).toEqual(
        ["https://a"]
      );
    });
    it("conserve l'ordre et ne touche pas une sélection valide", () => {
      expect(pruneSelection(["https://b", "https://a"], items)).toEqual([
        "https://b",
        "https://a",
      ]);
    });
  });
});
