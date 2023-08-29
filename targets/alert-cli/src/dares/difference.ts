import xlsx from "node-xlsx";
import { Diff, Agreement } from "./types";
import fs from "fs";

export function getDifferenceBetweenIndexAndDares(
  pathDares: string,
  pathIndex: string
): Diff {
  const workSheetsFromFile = xlsx.parse(pathDares);

  const supportedCcXlsx: Agreement[] = [];

  workSheetsFromFile[0].data.forEach((row: string[]) => {
    const ccNumber = parseInt(row[0]);
    const ccName = row[1];
    if (ccNumber && ccName) {
      const ccNameWithoutParenthesis = ccName
        .replace(/\(.*annexée.*\)/gi, "")
        .trim();
      supportedCcXlsx.push({
        name: ccNameWithoutParenthesis,
        num: ccNumber,
      });
    }
  });

  const dataJson = JSON.parse(fs.readFileSync(pathIndex, "utf8"));

  const supportedCcIndexJson: Agreement[] = dataJson.map((cc: any) => {
    return {
      name: cc.title,
      num: cc.num,
    };
  });

  const missingAgreementsFromDares: Agreement[] = supportedCcXlsx.filter(
    (ccIndex) =>
      !supportedCcIndexJson.find((ccXlsx) => ccXlsx.num === ccIndex.num)
  );

  const exceedingAgreementsFromKali = supportedCcIndexJson.filter(
    (ccXlsx) => !supportedCcXlsx.find((ccIndex) => ccIndex.num === ccXlsx.num)
  );

  return { missingAgreementsFromDares, exceedingAgreementsFromKali };
}
