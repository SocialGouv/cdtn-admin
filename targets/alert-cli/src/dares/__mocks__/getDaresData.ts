import { Agreement } from "../types";

export const getDaresData = async (): Promise<Agreement[]> => {
  return Promise.resolve([
    {
      name: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
      num: 16,
    },
    { name: "Convention collective nationale de l'industrie textile", num: 18 },
    {
      name: "Convention collective nationale des établissements privés d'hospitalisation, de soins, de cure et de garde à but non lucratif (FEHAP, convention de 1951)",
      num: 29,
    },
    {
      name: "Convention collective nationale de l'Import-export et du Commerce international",
      num: 43,
    },
  ]);
};
