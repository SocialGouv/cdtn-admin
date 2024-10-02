import { extractDaresXlsxFromMT } from "./scrapping";
import { downloadFileInTempFolder } from "./download";
import xlsx from "node-xlsx";

export const fetchDaresXlsx = async () => {
  const xlsxUrl = await extractDaresXlsxFromMT();
  const xlsxPath = await downloadFileInTempFolder(xlsxUrl, "dares.xlsx");
  const workSheetsFromFile: {
    name: string;
    data: any[][];
  }[] = xlsx.parse(xlsxPath);
  return workSheetsFromFile;
};
