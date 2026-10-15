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
});
