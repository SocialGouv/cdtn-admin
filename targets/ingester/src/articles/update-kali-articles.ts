import pMap from "p-map";

import { loadAgreement, loadArticles } from "../lib/data-loaders";
import {
  loadAgreementArticles,
  loadAgreements,
  updateAgreementArticles,
} from "./kali";

export const updateKaliArticles = async (): Promise<void> => {
  const { agreements } = await loadAgreements();

  let i = 0;
  await pMap(
    agreements,
    async ({ idcc, kali_id }) => {
      console.log(
        `updateKaliData: ${++i}/${
          agreements.length
        } Updating agreement for IDCC ${idcc}`
      );
      const articles = await loadAgreementArticles(
        kali_id,
        idcc,
        loadAgreement,
        loadArticles
      );
      await updateAgreementArticles(idcc, articles);
    },
    {
      concurrency: 10,
    }
  );
};
