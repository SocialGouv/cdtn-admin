import pMap from "p-map";

import { loadAgreements } from "../transform/agreements/data-loaders";
import updateAgreementsArticles from "./agreements-articles";

const isAgreementId = (id: number | string) =>
  typeof id === "string" && /^KALICONT\d{12}$/.test(id);

export const updateKaliData = async (): Promise<void> => {
  const agreements = (await loadAgreements()).filter(({ id }) =>
    isAgreementId(id)
  );

  let i = 0;
  await Promise.all(
    await pMap(
      agreements.map(({ id }) => id),
      async (id: string) => {
        console.log(
          `updateKaliData: ${i++}/${
            agreements.length
          } Updating agreement for ID=${id}`
        );
        return updateAgreementsArticles(id);
      },
      {
        concurrency: 10,
      }
    )
  );
};
