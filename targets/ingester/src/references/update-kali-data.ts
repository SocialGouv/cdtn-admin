import pMap from "p-map";

import { loadAgreements } from "../transform/agreements/data-loaders";
import updateAgreementsArticles from "./agreements-articles";

const isAgreementId = (id: number | string) =>
  typeof id === "string" && /^KALICONT\d{12}$/.test(id);

export const updateKaliData = async (): Promise<void> => {
  const agreements = (await loadAgreements()).filter(({ id }) =>
    isAgreementId(id)
  );

  // TODO @max
  await Promise.all(
    await pMap(
      agreements.map(({ id }) => id),
      async (id: string) => updateAgreementsArticles(id),
      {
        concurrency: 10,
      }
    )
  );

  // await Promise.all(
  //   agreements.map(async ({ id }, index) => {
  //     console.log(
  //       `updateKaliData ${index} Updating agreement cache for ID=${id}…`
  //     );
  //     await updateAgreementsArticles(id);
  //     console.log(
  //       `updateKaliData ${index} Agreement cache updated for ID=${id}.`
  //     );
  //   })
  // );
};
