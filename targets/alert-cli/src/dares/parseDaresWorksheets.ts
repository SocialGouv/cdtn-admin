import { Agreement } from "./types";

interface Worksheet {
  name: string;
  data: any[][];
}

// Depuis juin 2026, la DARES publie un fichier "Suivi historique" qui contient
// l'intégralité des conventions (historiques + en vigueur) réparties sur
// plusieurs onglets. On ne garde QUE les conventions de branche actuellement en
// vigueur (onglet "Conventions de branche", IDCCactif = 1) : on ignore
// volontairement l'onglet "Accords et statuts" (accords d'entreprise / statuts
// particuliers). Le README du fichier précise : « Pour retrouver la liste des
// conventions collectives actuellement en vigueur, il suffit de filtrer la
// variable IDCCactif [...] sur la modalité 1. »
const BRANCHE_SHEET_NAME = "Conventions de branche";
// Onglet des accords d'entreprise / statuts particuliers (IDCC 5XXX). On ne le
// parse PAS comme des conventions de branche, mais on en extrait les codes pour
// ne pas les remonter à tort comme « à supprimer » (voir
// parseDaresAccordsStatutsCodes).
const ACCORDS_SHEET_NAME = "Accords et statuts";
const HEADER_IDCC = "idcc";
const HEADER_NAME = "libelle";
const HEADER_ACTIVE = "idccactif";
// L'onglet "Accords et statuts" nomme sa colonne de codes "CODE" (et non
// "IDCC").
const HEADER_CODE = "code";
const SENTINEL_CODES = [9998, 9999];

const stripAccents = (value: string): string =>
  value.normalize("NFD").replace(/[̀-ͯ]/g, "");

const normalize = (value: unknown): string =>
  stripAccents(String(value ?? ""))
    .toLowerCase()
    .trim();

interface HeaderLocation {
  headerRowIndex: number;
  idccIndex: number;
  nameIndex: number;
  activeIndex: number;
}

// L'en-tête n'est plus à une position fixe et les colonnes peuvent être
// réordonnées : on repère la ligne d'en-tête et on résout les colonnes par leur
// libellé plutôt que par leur index.
const locateHeader = (data: any[][]): HeaderLocation | null => {
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex] ?? [];
    const idccIndex = row.findIndex((cell) => normalize(cell) === HEADER_IDCC);
    const nameIndex = row.findIndex((cell) => normalize(cell) === HEADER_NAME);
    const activeIndex = row.findIndex(
      (cell) => normalize(cell) === HEADER_ACTIVE
    );
    if (idccIndex !== -1 && nameIndex !== -1 && activeIndex !== -1) {
      return { headerRowIndex: rowIndex, idccIndex, nameIndex, activeIndex };
    }
  }
  return null;
};

export const parseDaresWorksheets = (worksheets: Worksheet[]): Agreement[] => {
  const sheet =
    worksheets.find((worksheet) => worksheet.name === BRANCHE_SHEET_NAME) ??
    worksheets.find((worksheet) => locateHeader(worksheet.data) !== null);

  if (!sheet) {
    throw new Error(
      `DARES: onglet "${BRANCHE_SHEET_NAME}" introuvable dans le tableur`
    );
  }

  const header = locateHeader(sheet.data);
  if (!header) {
    throw new Error(
      `DARES: en-tête (IDCC / Libellé / IDCCactif) introuvable dans l'onglet "${sheet.name}"`
    );
  }

  const { headerRowIndex, idccIndex, nameIndex, activeIndex } = header;

  return sheet.data
    .slice(headerRowIndex + 1)
    .reduce<Agreement[]>((agreements, row) => {
      if (Number(row[activeIndex]) !== 1) {
        return agreements;
      }
      const num = parseInt(String(row[idccIndex] ?? ""), 10);
      if (!num || SENTINEL_CODES.indexOf(num) !== -1) {
        return agreements;
      }
      const rawName = String(row[nameIndex] ?? "").trim();
      if (!rawName) {
        return agreements;
      }
      const name = rawName.replace(/\(.*annexée.*\)/gi, "").trim();
      return [...agreements, { name, num }];
    }, []);
};

// Localise la colonne des codes de l'onglet "Accords et statuts". Son en-tête,
// comme celui des conventions de branche, n'est pas à une position fixe : on
// résout la colonne "CODE" par son libellé.
const locateCodeColumn = (
  data: any[][]
): { headerRowIndex: number; codeIndex: number } | null => {
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex] ?? [];
    const codeIndex = row.findIndex((cell) => normalize(cell) === HEADER_CODE);
    if (codeIndex !== -1) {
      return { headerRowIndex: rowIndex, codeIndex };
    }
  }
  return null;
};

// Extrait les codes de l'onglet "Accords et statuts" (IDCC 5XXX, ex. 5623
// "France active"). Ces accords/statuts sont présents dans notre BDD
// (kali-data) mais volontairement absents des conventions de branche parsées :
// sans cette liste, la comparaison les remonterait à tort comme « à supprimer »
// (cf. difference.ts). On ne les parse donc PAS comme des conventions — on ne
// récupère que leurs codes pour les exclure des suppressions.
//
// Résilient : si l'onglet ou sa colonne "CODE" est introuvable (fichier DARES
// sans cet onglet), on renvoie une liste vide et on retombe sur l'ancien
// comportement plutôt que de planter.
export const parseDaresAccordsStatutsCodes = (
  worksheets: Worksheet[]
): number[] => {
  const sheet = worksheets.find(
    (worksheet) => worksheet.name === ACCORDS_SHEET_NAME
  );
  if (!sheet) {
    return [];
  }

  const header = locateCodeColumn(sheet.data);
  if (!header) {
    return [];
  }

  const { headerRowIndex, codeIndex } = header;

  return sheet.data
    .slice(headerRowIndex + 1)
    .reduce<number[]>((codes, row) => {
      const num = parseInt(String(row[codeIndex] ?? ""), 10);
      if (!num || SENTINEL_CODES.indexOf(num) !== -1) {
        return codes;
      }
      return codes.indexOf(num) === -1 ? [...codes, num] : codes;
    }, []);
};
