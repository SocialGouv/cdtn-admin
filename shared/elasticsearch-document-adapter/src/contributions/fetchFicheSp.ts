import { ApiClient } from "src/lib/api";
import {
  getContributionAnswerById,
  getGenericAnswerByQuestionId,
} from "./query";
import { ContributionsAnswers } from "@shared/types";
import { gqlClient } from "@shared/utils";

interface FetchContribPkData {
  contribution_answers_by_pk: ContributionsAnswers;
}

interface FetchContribQuestionIdData {
  contribution_answers: Partial<ContributionsAnswers[]>;
}

export class ContributionRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(id: string): Promise<ContributionsAnswers> {
    const { error, data } = await this.client.query<FetchContribPkData>(
      getContributionAnswerById,
      {
        id,
      }
    );
    if (error) {
      throw error;
    }
    if (!data) {
      throw new Error(`Aucune contribution pour l'id ${id}`);
    }
    return data.contribution_answers_by_pk;
  }

  async fetchGenericAnswer(
    questionId: string
  ): Promise<Partial<ContributionsAnswers>> {
    const { error, data } = await this.client.query<FetchContribQuestionIdData>(
      getGenericAnswerByQuestionId,
      {
        questionId,
      }
    );
    if (error) {
      throw error;
    }
    if (
      !data ||
      data.contribution_answers.length === 0 ||
      !data.contribution_answers[0]
    ) {
      throw new Error(
        `Aucune contribution générique pour la question id ${questionId}`
      );
    }
    return data.contribution_answers[0];
  }
}

import { gqlClient } from "@shared/utils";
import type { Client } from "@urql/core/dist/types/client";

import { fetchAllContributions } from "./query";
import type { QuestionRaw } from "./types";

export interface ContributionRepository {
  fetchAll: () => Promise<QuestionRaw[]>;
}

export class ContributionDatabase implements ContributionRepository {
  constructor() {
    this.client = gqlClient();
  }

  public async fetchAll(): Promise<QuestionRaw[]> {
    const res = await gqlClient()
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
