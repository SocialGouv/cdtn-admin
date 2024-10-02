import { getDaresData } from "../getDaresData";

jest.mock("../fetchDaresXlsx", () => {
  return {
    fetchDaresXlsx: () => {
      return [
        {
          name: "Liste IDCC-Publication",
          data: [
            ["IDENTIFIANT DE CONVENTION COLLECTIVE (IDCC) : "],
            [
              null,
              "CODES EN VIGUEUR POUR LE REMPLISSAGE de la DADS-U et de la DSN",
            ],
            [],
            ["IDCC", "TITRE DE LA CONVENTION"],
            [
              "0016",
              "Convention collective nationale des transports routiers et activités auxiliaires du transport",
            ],
            ["0018", "Convention collective nationale de l'industrie textile"],
            [
              "0029",
              "Convention collective nationale des établissements privés d'hospitalisation, de soins, de cure et de garde à but non lucratif (FEHAP, convention de 1951)",
            ],
            ["9998", "___Convention non encore en vigueur___"],
            ["9999", "___Sans convention collective___"],
          ],
        },
      ];
    },
  };
});

describe("getDaresData", () => {
  it("should work", async () => {
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
      {
        name: "Convention collective nationale des établissements privés d'hospitalisation, de soins, de cure et de garde à but non lucratif (FEHAP, convention de 1951)",
        num: 29,
      },
    ]);
  });
});
