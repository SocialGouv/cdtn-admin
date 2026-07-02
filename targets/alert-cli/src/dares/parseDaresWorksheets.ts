import { Agreement } from "./types";

interface Worksheet {
  name: string;
  data: any[][];
}

// Depuis juin 2026, la DARES publie un fichier "Suivi historique" qui contient
// l'intégralité des conventions (historiques + en vigueur) réparties sur
// plusieurs onglets. On ne garde que les conventions de branche actuellement en
// vigueur (IDCCactif = 1), ce qui correspond à l'ancienne liste
// "CODES EN VIGUEUR". Le README du fichier précise : « Pour retrouver la liste
// des conventions collectives actuellement en vigueur, il suffit de filtrer la
// variable IDCCactif [...] sur la modalité 1. »
const BRANCHE_SHEET_NAME = "Conventions de branche";
const HEADER_IDCC = "idcc";
const HEADER_NAME = "libelle";
const HEADER_ACTIVE = "idccactif";
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
