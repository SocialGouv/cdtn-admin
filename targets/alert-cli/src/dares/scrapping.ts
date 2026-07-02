import axios from "axios";
import { URL_SCRAPING } from "./config";

const DARES_BASE_URL = "https://travail-emploi.gouv.fr";

// La page liste désormais plusieurs fichiers .xlsx (ex. la "Grille de
// classification" en plus du fichier DARES) et le fichier IDCC n'est pas
// forcément le premier. On sélectionne donc explicitement le fichier DARES des
// conventions collectives. Le motif couvre l'ancien nom
// ("...identifiant_convention_collective...") comme le nouveau
// ("...Suivi_Historique_convention_collective...").
const DARES_XLSX_PATTERN = /dares.*convention.*collective/i;

export const extractDaresXlsxFromMT = async () => {
  const response = await axios.get(URL_SCRAPING, {
    headers: {
      "User-Agent": process.env.USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    },
  });
  const html: string = response.data;

  const hrefs: string[] = [];
  const regex = /href="([^"]*\.xlsx)"/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    hrefs.push(match[1]);
  }
  if (hrefs.length === 0) {
    throw new Error("No xlsx file found");
  }

  const daresHref =
    hrefs.find((href) => DARES_XLSX_PATTERN.test(href)) ?? hrefs[0];

  // `new URL` gère les liens absolus, relatifs à la racine ("/sites/...") et
  // relatifs simples ("file.xlsx"), sans produire de double slash.
  return new URL(daresHref, DARES_BASE_URL).href;
};
