import { Diff, Agreement } from "./types";
import { getDaresData } from "./getDaresData";
import { getAgreements } from "./getAgreementsData";

export async function getDifferenceBetweenIndexAndDares(): Promise<Diff> {
  const daresDataList = await getDaresData();
  const AgreementDataList = await getAgreements();

  const addedAgreementsFromDares: Agreement[] = daresDataList.filter(
    (daresData) =>
      !AgreementDataList.find(
        (agreementData) => agreementData.num === daresData.num
      )
  );

  const removedAgreementsFromDares = AgreementDataList.filter(
    (agreementData) =>
      !daresDataList.find((daresData) => daresData.num === agreementData.num)
  );

  return { addedAgreementsFromDares, removedAgreementsFromDares };
}
