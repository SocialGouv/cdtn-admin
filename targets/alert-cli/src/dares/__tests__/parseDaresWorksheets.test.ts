import fs from "fs";
import path from "path";
import xlsx from "node-xlsx";
import { parseDaresWorksheets } from "../parseDaresWorksheets";

const FIXTURE = path.join(
  __dirname,
  "../__mocks__/Dares_Suivi_Historique_convention_collective_Juin2026.xlsx"
);

// En-tête réel de l'onglet "Conventions de branche" du fichier DARES.
const BRANCHE_HEADER = [
  "IDCC",
  "Libellé",
  "Régime",
  "Champ d'application",
  "IDCCactif",
  "NouvIDCC",
];

const brancheSheet = (rows: any[][]) => [
  { name: "Lisez-moi", data: [["Note"], ["Dictionnaire des variables"]] },
  { name: "Conventions de branche", data: [BRANCHE_HEADER, ...rows] },
];

describe("parseDaresWorksheets", () => {
  describe("real DARES 'Suivi historique' file (Juin 2026)", () => {
    const result = parseDaresWorksheets(xlsx.parse(FIXTURE));

    it("keeps only the in-force branch conventions (IDCCactif = 1)", () => {
      expect(result).toHaveLength(485);
    });

    it("extracts the IDCC number and its full label", () => {
      expect(result).toContainEqual({
        num: 16,
        name: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
      });
    });

    it("excludes inactive conventions (IDCCactif = 0)", () => {
      // IDCC 00001 ("commerce stéphanois") is archived (IDCCactif = 0).
      expect(result.find((agreement) => agreement.num === 1)).toBeUndefined();
    });

    it("never returns the 9998 / 9999 sentinel codes", () => {
      expect(result.some(({ num }) => num === 9998 || num === 9999)).toBe(
        false
      );
    });

    it("returns unique IDCC numbers", () => {
      expect(new Set(result.map(({ num }) => num)).size).toBe(result.length);
    });
  });

  describe("parsing rules", () => {
    it("filters out inactive rows and parses zero-padded codes", () => {
      const result = parseDaresWorksheets(
        brancheSheet([
          ["00016", "Transports routiers", "Général", "National", 1, ""],
          ["00001", "Commerce stéphanois", "Général", "Local", 0, "01415"],
        ])
      );
      expect(result).toEqual([{ num: 16, name: "Transports routiers" }]);
    });

    it("resolves columns by header label even when they are reordered", () => {
      const result = parseDaresWorksheets([
        {
          name: "Conventions de branche",
          data: [
            ["IDCCactif", "Libellé", "IDCC"],
            [1, "Industrie textile", "00018"],
            [0, "Convention archivée", "00002"],
          ],
        },
      ]);
      expect(result).toEqual([{ num: 18, name: "Industrie textile" }]);
    });

    it("locates the header even when it is not on the first row", () => {
      const result = parseDaresWorksheets([
        {
          name: "Conventions de branche",
          data: [
            ["Note d'introduction"],
            [],
            BRANCHE_HEADER,
            [
              "00029",
              "Établissements privés (FEHAP)",
              "Général",
              "National",
              1,
              "",
            ],
          ],
        },
      ]);
      expect(result).toEqual([
        { num: 29, name: "Établissements privés (FEHAP)" },
      ]);
    });

    it("strips a '(… annexée …)' parenthetical from the label", () => {
      const result = parseDaresWorksheets(
        brancheSheet([
          [
            "00044",
            "Industrie chimique (convention annexée au régime général)",
            "Général",
            "National",
            1,
            "",
          ],
        ])
      );
      expect(result).toEqual([{ num: 44, name: "Industrie chimique" }]);
    });

    it("skips rows with an empty label", () => {
      const result = parseDaresWorksheets(
        brancheSheet([["00050", "", "Général", "National", 1, ""]])
      );
      expect(result).toEqual([]);
    });

    it("throws when no branch sheet can be found", () => {
      expect(() =>
        parseDaresWorksheets([{ name: "Lisez-moi", data: [["Note"]] }])
      ).toThrow(/introuvable/);
    });
  });

  it("uses the committed fixture that actually ships in the repo", () => {
    expect(fs.existsSync(FIXTURE)).toBe(true);
  });
});
