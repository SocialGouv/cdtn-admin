import { fetchDaresXlsx } from "./fetchDaresXlsx";
import {
  parseDaresWorksheets,
  parseDaresAccordsStatutsCodes,
} from "./parseDaresWorksheets";
import { Agreement } from "./types";

export interface DaresData {
  // Conventions de branche en vigueur (onglet "Conventions de branche").
  agreements: Agreement[];
  // Codes des accords d'entreprise / statuts particuliers (onglet "Accords et
  // statuts"), utilisés uniquement pour ne pas signaler leur suppression.
  accordsStatutsCodes: number[];
}

export const getDaresData = async (): Promise<DaresData> => {
  const worksheets = await fetchDaresXlsx();
  return {
    agreements: parseDaresWorksheets(worksheets),
    accordsStatutsCodes: parseDaresAccordsStatutsCodes(worksheets),
  };
};
