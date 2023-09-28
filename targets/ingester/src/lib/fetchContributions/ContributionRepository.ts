import { client } from "@shared/graphql-client";
import type { Client } from "@urql/core/dist/types/client";

import { fetchAllContributions } from "./query";
import type { QuestionRaw } from "./types";

export interface ContributionRepository {
  fetchAll: () => Promise<QuestionRaw[]>;
  fetchFicheSPIdsFromContributions: () => Promise<{ id: string }[]>;
}

export class ContributionDatabase implements ContributionRepository {
  constructor() {
    this.client = client;
  }

  public async fetchAll(): Promise<QuestionRaw[]> {
    const res = await client
      .query<{ contribution_questions: QuestionRaw[] }>(fetchAllContributions)
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.contribution_questions) {
      throw new Error("Failed to get contribution_questions");
    }
    return res.data.contribution_questions;
  }

  public async fetchFicheSPIdsFromContributions(): Promise<{ id: string }[]> {
    const ficheSPIdsQuery = `
      query GetAnswers {
      contribution_answers(where: {content_service_public_cdtn_id: {_is_null: false}, statuses: {status: {_eq: "PUBLISHED"}}}) {
        id: content_service_public_cdtn_id
      }
    }
    `;
    const res = await client
      .query<{ contribution_answers: { id: string }[] }>(ficheSPIdsQuery)
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.contribution_answers) {
      throw new Error("Failed to get contribution_answers");
    }
    return res.data.contribution_answers;
  }

  private readonly client: Client;
}
