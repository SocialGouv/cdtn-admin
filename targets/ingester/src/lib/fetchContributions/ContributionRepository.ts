import { gqlClient } from "@shared/utils";

import { fetchAllContributions } from "./query";
import type { QuestionRaw } from "./types";

export interface ContributionRepository {
  fetchAll: () => Promise<QuestionRaw[]>;
}

export class ContributionDatabase implements ContributionRepository {
  public async fetchAll(): Promise<QuestionRaw[]> {
    const res = await gqlClient()
      .query<{ questions: QuestionRaw[] }>(fetchAllContributions, {})
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.questions) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data.questions;
  }
}
