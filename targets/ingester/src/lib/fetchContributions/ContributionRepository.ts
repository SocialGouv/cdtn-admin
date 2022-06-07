import { client } from "@shared/graphql-client";
import type { Client } from "@urql/core/dist/types/client";

import { fetchAllContributions } from "./query";
import type { QuestionRaw } from "./types";

export class ContributionRepository {
  constructor() {
    this.client = client;
  }

  public async fetchAll(): Promise<QuestionRaw[]> {
    const res = await client
      .query<{ questions: QuestionRaw[] }>(fetchAllContributions)
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.questions) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data.questions;
  }

  private readonly client: Client;
}
