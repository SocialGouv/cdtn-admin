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
      ];
    },
  };
});

describe("getDaresData", () => {
  it("returns the in-force branch conventions parsed from the DARES xlsx", async () => {
    const result = await getDaresData();
    expect(result).toEqual([
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
});
