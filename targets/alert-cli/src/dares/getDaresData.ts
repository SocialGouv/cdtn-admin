import { fetchDaresXlsx } from "./fetchDaresXlsx";
import { parseDaresWorksheets } from "./parseDaresWorksheets";

export const getDaresData = async () => {
  const worksheets = await fetchDaresXlsx();
  return parseDaresWorksheets(worksheets);
};
