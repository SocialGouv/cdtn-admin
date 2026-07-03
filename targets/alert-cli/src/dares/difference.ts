import { Diff, Agreement } from "./types";
import { getDaresData } from "./getDaresData";
import { getAgreements } from "./getAgreementsData";

export async function getDifferenceBetweenIndexAndDares(): Promise<Diff> {
  const { agreements: daresDataList, accordsStatutsCodes } =
    await getDaresData();
  const AgreementDataList = await getAgreements();

  const addedAgreementsFromDares: Agreement[] = daresDataList.filter(
    (daresData) =>
      !AgreementDataList.find(
        (agreementData) => agreementData.num === daresData.num
      )
  );

  // On ne signale la suppression que pour les conventions de branche. Les
  // accords d'entreprise / statuts particuliers (onglet "Accords et statuts",
  // IDCC 5XXX comme le 5623) sont volontairement absents des conventions de
  // branche parsées : sans ce garde-fou, chaque accord présent dans notre BDD
  // serait remonté à tort comme « présent dans la base du CDTN mais absent du
  // fichier DARES » donc « à supprimer ».
  const accordsStatuts = new Set(accordsStatutsCodes);
  const removedAgreementsFromDares = AgreementDataList.filter(
    (agreementData) =>
      !accordsStatuts.has(agreementData.num) &&
      !daresDataList.find((daresData) => daresData.num === agreementData.num)
  );

  return { addedAgreementsFromDares, removedAgreementsFromDares };
}
