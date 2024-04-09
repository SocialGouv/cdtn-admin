import type { IndexedArticle } from "@socialgouv/kali-data";
import type { Agreement } from "@socialgouv/kali-data-types";

import { getJson } from "./getJson";

export const loadAgreement = async (
  agreementId: string
): Promise<Agreement> => {
  return getJson<Agreement>(`@socialgouv/kali-data/data/${agreementId}.json`);
};

export const loadArticles = async (): Promise<IndexedArticle[]> =>
  getJson<IndexedArticle[]>(`@socialgouv/kali-data/data/articles/index.json`);
