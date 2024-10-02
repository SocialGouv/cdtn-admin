import { GetAgreementData } from "../getAgreementsData";

export async function getAgreements(): Promise<GetAgreementData[]> {
  return Promise.resolve([
    {
      name: "Convention collective nationale des transports routiers et activités auxiliaires du transport",
      num: 16,
    },
    {
      name: "Convention collective nationale de l'industrie textile du 1er  février 1951.  Etendue par arrêté du 17 décembre 1951, rectificatif du 13 janvier 1952, mise à jour le 29 mai 1979, en vigueur le 1er octobre 1979. Etendue par arrêté du 23 octobre 1979. JONC 12 janvier 1980 ",
      num: 18,
    },
    {
      name: "Convention collective nationale des établissements privés d'hospitalisation, de soins, de cure et de garde à but non lucratif (FEHAP, convention de 1951)",
      num: 29,
    },
    {
      name: "Convention collective nationale des industries chimiques et connexes",
      num: 44,
    },
  ]);
}
