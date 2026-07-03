import fs from "fs";
import path from "path";
import xlsx from "node-xlsx";
import {
  parseDaresWorksheets,
  parseDaresAccordsStatutsCodes,
  parseDaresSuccessorCodes,
} from "../parseDaresWorksheets";

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

    it("ignores the 'Accords et statuts' sheet (enterprise agreements)", () => {
      // "France active" (code 5630) lives in the second sheet and must NOT be
      // parsed: only branch conventions (IDCC) are tracked.
      expect(
        result.find((agreement) => agreement.num === 5630)
      ).toBeUndefined();
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

describe("parseDaresAccordsStatutsCodes", () => {
  describe("real DARES 'Suivi historique' file (Juin 2026)", () => {
    const codes = parseDaresAccordsStatutsCodes(xlsx.parse(FIXTURE));

    it("collects the codes of the in-force accords/statuts (CODEactif = 1)", () => {
      // 5623 / 5630 sont des accords/statuts en vigueur : présents dans notre
      // BDD mais absents des conventions de branche. On doit les récupérer pour
      // ne pas les remonter comme « à supprimer ».
      expect(codes).toContain(5623);
      expect(codes).toContain(5630);
    });

    it("excludes inactive accords/statuts (CODEactif = 0)", () => {
      // 5004 ("Statut EPAVN villes nouvelles") et 926 sont inactifs dans la
      // DARES : ils restent des candidats légitimes à la suppression, donc on
      // ne les met PAS dans la liste d'exclusion.
      expect(codes).not.toContain(5004);
      expect(codes).not.toContain(926);
    });

    it("does not return the branch conventions", () => {
      // 16 (transports routiers) est une convention de branche, pas un accord.
      expect(codes).not.toContain(16);
    });

    it("never returns the 9998 / 9999 sentinel codes", () => {
      expect(codes.some((code) => code === 9998 || code === 9999)).toBe(false);
    });

    it("returns unique codes", () => {
      expect(new Set(codes).size).toBe(codes.length);
    });
  });

  it("returns an empty list when the 'Accords et statuts' sheet is absent", () => {
    expect(
      parseDaresAccordsStatutsCodes([
        { name: "Conventions de branche", data: [["IDCC"]] },
      ])
    ).toEqual([]);
  });

  it("locates the CODE / CODEactif columns even when reordered / not first, and filters inactive", () => {
    const codes = parseDaresAccordsStatutsCodes([
      {
        name: "Accords et statuts",
        data: [
          ["Note d'introduction"],
          ["Libellé", "CODEactif", "CODE"],
          ["France active", 1, "05623"],
          ["Statut archivé", 0, "05004"],
        ],
      },
    ]);
    expect(codes).toEqual([5623]);
  });
});

describe("parseDaresSuccessorCodes", () => {
  describe("real DARES 'Suivi historique' file (Juin 2026)", () => {
    const successors = parseDaresSuccessorCodes(xlsx.parse(FIXTURE));

    it("maps an old branch IDCC to its NouvIDCC successor", () => {
      // 00001 (commerce stéphanois, archivé) -> 01415.
      expect(successors.get(1)).toBe(1415);
      expect(successors.get(2)).toBe(18);
    });

    it("maps an old accord CODE to its NouvCODE successor", () => {
      // 00926 (secours minières, archivé) -> 05527.
      expect(successors.get(926)).toBe(5527);
    });

    it("does not map codes that have no successor (in-force conventions)", () => {
      // 16 (transports routiers) est en vigueur : pas de successeur.
      expect(successors.has(16)).toBe(false);
    });
  });

  it("combines both sheets and ignores empty successor cells", () => {
    const successors = parseDaresSuccessorCodes([
      {
        name: "Conventions de branche",
        data: [
          ["IDCC", "Libellé", "IDCCactif", "NouvIDCC"],
          ["00002", "Archivée", 0, "00018"],
          ["00016", "En vigueur", 1, ""],
        ],
      },
      {
        name: "Accords et statuts",
        data: [
          ["CODE", "Libellé", "CODEactif", "NouvCODE"],
          ["00926", "Archivé", 0, "05527"],
        ],
      },
    ]);
    expect(Array.from(successors.entries())).toEqual([
      [2, 18],
      [926, 5527],
    ]);
  });

  it("returns an empty map when the sheets are absent", () => {
    expect(parseDaresSuccessorCodes([{ name: "Lisez-moi", data: [] }]).size).toBe(
      0
    );
  });
});
