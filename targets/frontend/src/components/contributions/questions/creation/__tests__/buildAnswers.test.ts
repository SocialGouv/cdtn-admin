import { buildAnswers, todayIso } from "../buildAnswers";

const agreements = [
  { id: "0016", name: "Transports routiers", unextended: false },
  { id: "0029", name: "Hospitalisation privée", unextended: true },
  { id: "0044", name: "Industries chimiques", unextended: false },
  { id: "1486", name: "Bureaux d'études", unextended: false },
  { id: "2216", name: "Commerce de détail", unextended: false },
];

describe("todayIso", () => {
  it("formate la date au format ISO attendu par display_date", () => {
    expect(todayIso(new Date(2026, 9, 14))).toBe("2026-10-14");
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("buildAnswers", () => {
  const base = {
    agreements,
    genericContent: "<p>Réponse CDT</p>",
    template: "<p><mark>à relire</mark></p>",
    displayDate: "2026-10-14",
    userId: "user-1",
  };

  it("crée la réponse générique en ANSWER, « En rédaction », avec la réponse CDT", () => {
    const answers = buildAnswers({
      ...base,
      types: {
        "0016": "ANSWER",
        "0044": "NOTHING",
        "1486": "CDT",
        "2216": "UNKNOWN",
      },
    });
    expect(answers[0]).toEqual({
      display_date: "2026-10-14",
      agreement_id: "0000",
      content_type: "ANSWER",
      content: "<p>Réponse CDT</p>",
      statuses: { data: [{ status: "REDACTING", user_id: "user-1" }] },
    });
  });

  it("copie le template uniquement pour les CC « Afficher la réponse »", () => {
    const answers = buildAnswers({
      ...base,
      types: {
        "0016": "ANSWER",
        "0044": "NOTHING",
        "1486": "CDT",
        "2216": "UNFAVOURABLE",
      },
    });
    const byId = Object.fromEntries(answers.map((a) => [a.agreement_id, a]));
    expect(byId["0016"]).toEqual({
      display_date: "2026-10-14",
      agreement_id: "0016",
      content_type: "ANSWER",
      content: "<p><mark>à relire</mark></p>",
    });
    expect(byId["0044"]).toEqual({
      display_date: "2026-10-14",
      agreement_id: "0044",
      content_type: "NOTHING",
    });
    expect(byId["1486"].content_type).toBe("CDT");
    expect(byId["1486"].content).toBeUndefined();
    expect(byId["2216"].content_type).toBe("UNFAVOURABLE");
  });

  it("met les CC non étendues en NOTHING", () => {
    const answers = buildAnswers({
      ...base,
      types: { "0016": "ANSWER", "0044": "CDT", "1486": "CDT", "2216": "CDT" },
    });
    expect(answers.find((a) => a.agreement_id === "0029")?.content_type).toBe(
      "NOTHING"
    );
  });

  it("ne met aucun statut sur les CC (« À traiter » implicite)", () => {
    const answers = buildAnswers({
      ...base,
      types: { "0016": "ANSWER", "0044": "CDT", "1486": "CDT", "2216": "CDT" },
    });
    expect(answers.slice(1).every((a) => a.statuses === undefined)).toBe(true);
  });

  it("crée une réponse ANSWER sans contenu quand le template est vide", () => {
    const answers = buildAnswers({
      ...base,
      template: "",
      types: { "0016": "ANSWER", "0044": "CDT", "1486": "CDT", "2216": "CDT" },
    });
    expect(
      answers.find((a) => a.agreement_id === "0016")?.content
    ).toBeUndefined();
  });

  it("refuse une CC sans type", () => {
    expect(() =>
      buildAnswers({ ...base, types: { "0016": "ANSWER" } })
    ).toThrow("CC 0044");
  });

  describe("introduction et références de la réponse du Code du travail", () => {
    const types = {
      "0016": "ANSWER" as const,
      "0044": "CDT" as const,
      "1486": "CDT" as const,
      "2216": "CDT" as const,
    };

    it("ajoute l'introduction à la réponse générique uniquement", () => {
      const answers = buildAnswers({
        ...base,
        types,
        genericIntroduction: "<p>Intro CDT</p>",
      });
      expect(answers[0].introduction).toBe("<p>Intro CDT</p>");
      expect(answers.slice(1).every((a) => a.introduction === undefined)).toBe(
        true
      );
    });

    it("n'ajoute pas d'introduction vide", () => {
      const answers = buildAnswers({
        ...base,
        types,
        genericIntroduction: "  ",
      });
      expect(answers[0]).not.toHaveProperty("introduction");
    });

    it("imbrique les articles et autres références (sans contenu lié) dans la réponse générique", () => {
      const answers = buildAnswers({
        ...base,
        types,
        genericLegiReferences: [
          { legiArticle: { id: "LEGIARTI1", label: "L3141-1", cid: "C1" } },
        ],
        genericOtherReferences: [
          { label: "Circulaire", url: "https://exemple.fr" },
          { label: "Sans lien", url: "" },
        ],
      });
      expect(answers[0].legi_references).toEqual({
        data: [{ article_id: "LEGIARTI1" }],
      });
      expect(answers[0].other_references).toEqual({
        data: [
          { label: "Circulaire", url: "https://exemple.fr" },
          { label: "Sans lien", url: undefined },
        ],
      });
      expect(answers[0]).not.toHaveProperty("cdtn_references");
    });

    it("n'ajoute pas de références aux réponses des CC", () => {
      const answers = buildAnswers({
        ...base,
        types,
        genericLegiReferences: [
          { legiArticle: { id: "LEGIARTI1", label: "L3141-1", cid: "C1" } },
        ],
      });
      expect(
        answers.slice(1).every((a) => a.legi_references === undefined)
      ).toBe(true);
    });

    it("n'ajoute pas de clé quand il n'y a aucune référence", () => {
      const answers = buildAnswers({ ...base, types });
      expect(answers[0]).not.toHaveProperty("legi_references");
      expect(answers[0]).not.toHaveProperty("other_references");
    });
  });
});
