import {
  resolveContentVariables,
  resolveHtml,
  selectIntroduction,
} from "../generateIntroduction";

describe("generateIntroduction", () => {
  const introductions = {
    introduction_nothing: "<p>Rien dans la CC</p>",
    introduction_cdt: "<p>Renvoi au CDT</p>",
  };

  describe("selectIntroduction", () => {
    it("retourne l'introduction « ne prévoit rien » pour NOTHING", () => {
      expect(selectIntroduction("NOTHING", introductions)).toBe(
        "<p>Rien dans la CC</p>"
      );
    });

    it("retourne l'introduction « renvoie au CDT » pour CDT", () => {
      expect(selectIntroduction("CDT", introductions)).toBe(
        "<p>Renvoi au CDT</p>"
      );
    });

    it.each([
      "ANSWER",
      "UNFAVOURABLE",
      "UNKNOWN",
      "SP",
      "GENERIC_NO_CDT",
      null,
    ])("ne retourne rien pour %s", (type) => {
      expect(selectIntroduction(type as any, introductions)).toBeUndefined();
    });

    it("ne retourne rien si l'introduction est vide ou absente", () => {
      expect(
        selectIntroduction("NOTHING", {
          introduction_nothing: "  ",
          introduction_cdt: null,
        })
      ).toBeUndefined();
      expect(
        selectIntroduction("CDT", {
          introduction_nothing: null,
          introduction_cdt: null,
        })
      ).toBeUndefined();
      expect(selectIntroduction("NOTHING", undefined)).toBeUndefined();
    });
  });

  describe("resolveHtml", () => {
    const html =
      '<p>La convention <span data-variable="agreement_name">Nom de la CC</span></p>';

    it("remplace la variable par le nom de la CC", () => {
      expect(
        resolveHtml(
          html,
          { agreement_name: "Banque" },
          "Contribution 1 - 0029",
          "introduction"
        )
      ).toBe("<p>La convention Banque</p>");
    });

    it("bloque l'export avec le contexte de la contribution si la variable est inconnue", () => {
      expect(() =>
        resolveHtml(
          '<span data-variable="idcc">x</span>',
          { agreement_name: "Banque" },
          "Contribution 1 - 0029",
          "introduction"
        )
      ).toThrow(
        'Contribution 1 - 0029 : Variable de contribution inconnue : "idcc" (introduction)'
      );
    });

    it("bloque l'export si la valeur est manquante (réponse générique)", () => {
      expect(() =>
        resolveHtml(html, {}, "Contribution 1 - 0000", "réponse")
      ).toThrow("Contribution 1 - 0000");
    });

    it("bloque l'export si du surlignage subsiste", () => {
      expect(() =>
        resolveHtml(
          "<p><mark>à relire</mark></p>",
          {},
          "Contribution 1 - 0029",
          "réponse"
        )
      ).toThrow("contient du texte surligné");
    });
  });

  describe("resolveContentVariables", () => {
    it("résout le contenu d'une réponse", () => {
      const result = resolveContentVariables(
        {
          content: '<span data-variable="agreement_name">x</span>',
          infographics: [],
        },
        { agreement_name: "Banque" },
        "Contribution 1 - 0029"
      );
      expect(result).toEqual({ content: "Banque", infographics: [] });
    });

    it("laisse inchangés les contenus sans HTML de réponse (fiche SP, générique sans CDT)", () => {
      const content = { messageBlockGenericNoCDT: "message" };
      expect(resolveContentVariables(content, {}, "x")).toBe(content);
    });
  });
});
