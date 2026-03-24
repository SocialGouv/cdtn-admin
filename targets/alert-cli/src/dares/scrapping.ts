import axios from "axios";
import { URL_SCRAPING } from "./config";

export const extractDaresXlsxFromMT = async () => {
  const response = await axios.get(URL_SCRAPING, {
    headers: {
      "User-Agent": process.env.USER_AGENT,
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
  return `https://travail-emploi.gouv.fr/${match[1]}`;
};
