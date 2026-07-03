import { fetchDaresXlsx } from "./fetchDaresXlsx";
import {
  parseDaresWorksheets,
  parseDaresAccordsStatutsCodes,
  parseDaresSuccessorCodes,
} from "./parseDaresWorksheets";
import { Agreement } from "./types";

export interface DaresData {
  // Conventions de branche en vigueur (onglet "Conventions de branche").
  agreements: Agreement[];
  // Codes des accords d'entreprise / statuts particuliers (onglet "Accords et
  // statuts"), utilisés uniquement pour ne pas signaler leur suppression.
  accordsStatutsCodes: number[];
  // Table "ancien code -> nouveau code" (NouvIDCC / NouvCODE), pour indiquer
  // dans l'alerte la convention qui remplace celle qui disparaît.
  successorCodes: Map<number, number>;
}

export const getDaresData = async (): Promise<DaresData> => {
  const worksheets = await fetchDaresXlsx();
  return {
    agreements: parseDaresWorksheets(worksheets),
    accordsStatutsCodes: parseDaresAccordsStatutsCodes(worksheets),
    successorCodes: parseDaresSuccessorCodes(worksheets),
  };
};
