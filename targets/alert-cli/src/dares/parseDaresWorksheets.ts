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
// L'onglet "Accords et statuts" nomme ses colonnes "CODE" / "CODEactif" (et non
// "IDCC" / "IDCCactif").
const HEADER_CODE = "code";
const HEADER_CODE_ACTIVE = "codeactif";
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

// Localise, dans l'onglet "Accords et statuts", la colonne des codes ("CODE")
// et celle d'activité ("CODEactif"). Comme pour les conventions de branche,
// l'en-tête n'est pas à une position fixe : on résout les colonnes par leur
// libellé. `activeIndex` vaut -1 si la colonne d'activité est absente.
const locateAccordsColumns = (
  data: any[][]
): { headerRowIndex: number; codeIndex: number; activeIndex: number } | null => {
  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const row = data[rowIndex] ?? [];
    const codeIndex = row.findIndex((cell) => normalize(cell) === HEADER_CODE);
    if (codeIndex !== -1) {
      const activeIndex = row.findIndex(
        (cell) => normalize(cell) === HEADER_CODE_ACTIVE
      );
      return { headerRowIndex: rowIndex, codeIndex, activeIndex };
    }
  }
  return null;
};

// Extrait les codes des accords/statuts EN VIGUEUR de l'onglet "Accords et
// statuts" (IDCC 5XXX comme 5623 "France active", mais aussi des accords à
// codes bas type 804 VRP). Ces accords/statuts sont présents dans notre BDD
// (kali-data) mais volontairement absents des conventions de branche parsées :
// sans cette liste, la comparaison les remonterait à tort comme « à supprimer »
// (cf. difference.ts). On ne les parse donc PAS comme des conventions — on ne
// récupère que leurs codes pour les exclure des suppressions.
//
// On ne garde que les accords ACTIFS (CODEactif = 1), par symétrie avec les
// conventions de branche (IDCCactif = 1) : un accord inactif dans le fichier
// DARES reste, lui, un candidat légitime à la suppression.
//
// Résilient : si l'onglet ou sa colonne "CODE" est introuvable (fichier DARES
// sans cet onglet), on renvoie une liste vide et on retombe sur l'ancien
// comportement plutôt que de planter. Si seule la colonne "CODEactif" manque
// (activeIndex === -1), on n'applique pas le filtre d'activité.
export const parseDaresAccordsStatutsCodes = (
  worksheets: Worksheet[]
): number[] => {
  const sheet = worksheets.find(
    (worksheet) => worksheet.name === ACCORDS_SHEET_NAME
  );
  if (!sheet) {
    return [];
  }

  const header = locateAccordsColumns(sheet.data);
  if (!header) {
    return [];
  }

  const { headerRowIndex, codeIndex, activeIndex } = header;

  return sheet.data
    .slice(headerRowIndex + 1)
    .reduce<number[]>((codes, row) => {
      if (activeIndex !== -1 && Number(row[activeIndex]) !== 1) {
        return codes;
      }
      const num = parseInt(String(row[codeIndex] ?? ""), 10);
      if (!num || SENTINEL_CODES.indexOf(num) !== -1) {
        return codes;
      }
      return codes.indexOf(num) === -1 ? [...codes, num] : codes;
    }, []);
};
