import { Agreement } from "./types";
import { fetchDaresXlsx } from "./fetchDaresXlsx";

export const getDaresData = async () => {
  const workSheetsFromFile: {
    name: string;
    data: any[][];
  }[] = await fetchDaresXlsx();
  console.log("workSheetsFromFile", JSON.stringify(workSheetsFromFile));

  return workSheetsFromFile[0].data.reduce<Agreement[]>((arr, row) => {
    const ccNumber = parseInt(row[0]);
    if ([9998, 9999].indexOf(ccNumber) !== -1) {
      return arr;
    }
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
