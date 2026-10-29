import {
  applyTypeToSelection,
  countByType,
  filterAgreements,
  getRemainingAgreements,
  initAgreementTypes,
  sortByIdcc,
} from "../agreementTypes";

const agreements = [
  { id: "0016", name: "Transports routiers", unextended: false },
  {
    id: "0029",
    name: "Établissements privés d'hospitalisation",
    unextended: true,
  },
  { id: "1486", name: "Bureaux d'études techniques", unextended: false },
];

describe("agreementTypes", () => {
  it("verrouille les CC non étendues sur NOTHING et les compte comme renseignées", () => {
    const types = initAgreementTypes(agreements);
    expect(types).toEqual({ "0029": "NOTHING" });
    expect(getRemainingAgreements(agreements, types).map((a) => a.id)).toEqual([
      "0016",
      "1486",
    ]);
  });

  it("compte les CC par type, y compris les non étendues", () => {
    const counts = countByType(agreements, {
      "0016": "ANSWER",
      "1486": "CDT",
    });
    expect(counts).toEqual({
      ANSWER: 1,
      NOTHING: 1,
      CDT: 1,
      UNFAVOURABLE: 0,
      UNKNOWN: 0,
    });
  });

  it("filtre par nom (sans accent ni casse) ou par IDCC", () => {
    expect(
      filterAgreements(agreements, "etablissements").map((a) => a.id)
    ).toEqual(["0029"]);
    expect(filterAgreements(agreements, "BUREAUX").map((a) => a.id)).toEqual([
      "1486",
    ]);
    expect(filterAgreements(agreements, "16").map((a) => a.id)).toEqual([
      "0016",
    ]);
    expect(filterAgreements(agreements, "0016").map((a) => a.id)).toEqual([
      "0016",
    ]);
    expect(filterAgreements(agreements, "  ")).toHaveLength(3);
  });

  it("applique un type à la sélection sans toucher aux CC non étendues", () => {
    const types = initAgreementTypes(agreements);
    const next = applyTypeToSelection(
      agreements,
      types,
      ["0016", "0029"],
      "UNKNOWN"
    );
    expect(next).toEqual({ "0016": "UNKNOWN", "0029": "NOTHING" });
    // immutabilité
    expect(types).toEqual({ "0029": "NOTHING" });
  });

  it("trie par IDCC croissant, sans modifier la liste d'origine", () => {
    const unsorted = [
      { id: "1486", name: "Bureaux d'études", unextended: false },
      { id: "0016", name: "Transports routiers", unextended: false },
      { id: "0029", name: "Hospitalisation privée", unextended: true },
      { id: "0003", name: "Zéro trois", unextended: false },
    ];
    expect(sortByIdcc(unsorted).map((a) => a.id)).toEqual([
      "0003",
      "0016",
      "0029",
      "1486",
    ]);
    expect(unsorted.map((a) => a.id)).toEqual(["1486", "0016", "0029", "0003"]);
  });
});
