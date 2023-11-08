import { ApiClient } from "src/lib/api";
import { getContributionAnswerById } from "./query";
import { ContributionsAnswers } from "@shared/types";

interface Data {
  contribution_answers_by_pk: ContributionsAnswers;
}

export class ContributionRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(id: string): Promise<ContributionsAnswers> {
    const { error, data } = await this.client.query<Data>(
      getContributionAnswerById,
      {
        id,
      }
    );
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`Pas de modèles de courrier pour l'id ${id}`);
    }
    return data.contribution_answers_by_pk;
  }
}
