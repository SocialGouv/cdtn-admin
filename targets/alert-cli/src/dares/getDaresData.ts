import { extractDaresXlsxFromMT } from "./scrapping";
import { downloadFileInTempFolder } from "./download";
import xlsx from "node-xlsx";
import { Agreement } from "./types";

export const getDaresData = async () => {
  const xlsxUrl = await extractDaresXlsxFromMT();
  const xlsxPath = await downloadFileInTempFolder(xlsxUrl, "dares.xlsx");
  const workSheetsFromFile = xlsx.parse(xlsxPath);

  return workSheetsFromFile[0].data.reduce<Agreement[]>((arr, row) => {
    const ccNumber = parseInt(row[0]);

    const ccName = row[1] as string;
    if (ccNumber && ccName) {
      const ccNameWithoutParenthesis = ccName
        .replace(/\(.*annexée.*\)/gi, "")
        .trim();
      return [
        ...arr,
        {
          name: ccNameWithoutParenthesis,
          num: ccNumber,
        },
      ];
    }
    return arr;
  }, []);
};
