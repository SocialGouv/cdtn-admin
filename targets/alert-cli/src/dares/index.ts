import { URL_KALI } from "./config";
import { getDifferenceBetweenIndexAndDares } from "./difference";
import { downloadFileInTempFolder } from "./download";
import { saveDiff } from "./save";
import { extractDaresXlsxFromMT } from "./scrapping";

export const runDares = async () => {
  const xlsxUrl = await extractDaresXlsxFromMT();
  const xlsxPath = await downloadFileInTempFolder(xlsxUrl, "dares.xlsx");
  const indexPath = await downloadFileInTempFolder(URL_KALI, "index.json");
  const diff = await getDifferenceBetweenIndexAndDares(xlsxPath, indexPath);
  await saveDiff(diff);
};
