import axios from "axios";
import { URL_SCRAPING } from "./config";

export const extractDaresXlsxFromMT = async () => {
  const response = await axios.get(URL_SCRAPING, {
    headers: {
      Cookie: `cgtoken=${process.env.TOKEN_MT};`,
    },
  });
  const html = response.data;
  const regex = /href="([^"]*\.xlsx)"/g;
  const match = regex.exec(html);
  if (!match) {
    throw new Error("No xlsx file found");
  }
  if (match[1].startsWith("http")) {
    return match[1];
  }
  const baseRegex = /<base href="(.*)" \/>/g;
  const baseMatch = baseRegex.exec(html);
  if (!baseMatch) {
    throw new Error(`xlsx file url not valid : ${match[1]}`);
  }
  return `${baseMatch[1]}/${match[1]}`;
};
