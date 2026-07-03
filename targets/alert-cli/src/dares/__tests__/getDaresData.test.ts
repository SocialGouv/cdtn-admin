import { getDaresData } from "../getDaresData";

jest.mock("../fetchDaresXlsx", () => {
  return {
    fetchDaresXlsx: () => {
      return [
        {
          name: "Lisez-moi",
          data: [["Note"], ["Dictionnaire des variables"]],
        },
        {
          name: "Conventions de branche",
          data: [
            [
              "IDCC",
              "Libellé",
              "Régime",
              "Champ d'application",
              "IDCCactif",
              "NouvIDCC",
            ],
            [
              "00016",
              "Convention collective nationale des transports routiers et activités auxiliaires du transport",
              "Général",
              "National",
              1,
              "",
            ],
            [
              "00001",
              "Convention collective pour le commerce stéphanois",
              "Général",
              "Local",
              0,
              "01415",
            ],
            [
              "00018",
              "Convention collective nationale de l'industrie textile",
              "Général",
              "National",
              1,
              "",
            ],
          ],
        },
        {
          name: "Accords et statuts",
          data: [
            ["CODE", "Libellé", "Champ d'application", "CODEactif", "NouvCODE"],
            ["05623", "France active", "National", 1, ""],
            ["05630", "Statut particulier", "National", 1, ""],
            ["05004", "Statut inactif (archivé)", "National", 0, ""],
          ],
        },
      ];
    },
  };
});

describe("getDaresData", () => {
  it("returns the in-force branch conventions parsed from the DARES xlsx", async () => {
    const result = await getDaresData();
    expect(result.agreements).toEqual([
      {
        name: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
        num: 16,
      },
      {
        name: "Convention collective nationale de l'industrie textile",
        num: 18,
      },
    ]);
  });

  it("collects the 'Accords et statuts' codes (to exclude them from removals)", async () => {
    const result = await getDaresData();
    expect(result.accordsStatutsCodes).toEqual([5623, 5630]);
  });

  it("builds the successor table from NouvIDCC / NouvCODE", async () => {
    // La ligne inactive 00001 pointe vers son successeur 01415 (NouvIDCC).
    const result = await getDaresData();
    expect(result.successorCodes.get(1)).toBe(1415);
  });
});
