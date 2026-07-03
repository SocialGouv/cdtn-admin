import { Diff, Agreement } from "./types";
import { getDaresData } from "./getDaresData";
import { getAgreements } from "./getAgreementsData";

export async function getDifferenceBetweenIndexAndDares(): Promise<Diff> {
  const { agreements: daresDataList, accordsStatutsCodes, successorCodes } =
    await getDaresData();
  const AgreementDataList = await getAgreements();

  // Renseigne le code successeur (NouvIDCC / NouvCODE) quand la DARES indique
  // que la convention a été fusionnée/remplacée.
  const withSuccessor = (agreement: Agreement): Agreement => {
    const newNum = successorCodes.get(agreement.num);
    return newNum ? { ...agreement, newNum } : agreement;
  };

  const addedAgreementsFromDares: Agreement[] = daresDataList
    .filter(
      (daresData) =>
        !AgreementDataList.find(
          (agreementData) => agreementData.num === daresData.num
        )
    )
    .map(withSuccessor);

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
  ).map(withSuccessor);

  return { addedAgreementsFromDares, removedAgreementsFromDares };
}
