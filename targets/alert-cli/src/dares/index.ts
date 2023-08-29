import { URL_KALI, URL_SCRAPING } from "./config";
import { getDifferenceBetweenIndexAndDares } from "./difference";
import { downloadFileInTempFolder } from "./download";
import { saveDiff } from "./save";
import { extractXlsxFromUrl } from "./scrapping";

export const runDares = async () => {
  const xlsxUrl = await extractXlsxFromUrl(URL_SCRAPING);
  const xlsxPath = await downloadFileInTempFolder(xlsxUrl, "dares.xlsx");
  const indexPath = await downloadFileInTempFolder(URL_KALI, "index.json");
  const diff = await getDifferenceBetweenIndexAndDares(xlsxPath, indexPath);
  await saveDiff(diff);
};
