import { ApiClient } from "src/lib/api";
import {
  getAllContributionsByQuestionId,
  getContributionAnswerById,
  getGenericAnswerByQuestionId,
} from "./query";
import { ContributionsAnswers } from "@socialgouv/cdtn-types";
import { updatePublicationMutation } from "./mutation";

interface FetchContribPkData {
  contribution_answers_by_pk: ContributionsAnswers;
}

interface FetchContribQuestionIdData {
  contribution_answers: Partial<ContributionsAnswers[]>;
}

interface FetchAllContribData {
  contribution_answers: Pick<ContributionsAnswers, "id" | "statuses">[];
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

  async fetchAllPublishedContributionsByQuestionId(
    questionId: string
  ): Promise<FetchAllContribData["contribution_answers"]> {
    const { error, data } = await this.client.query<FetchAllContribData>(
      getAllContributionsByQuestionId,
      { questionId }
    );
    if (error || !data) {
      console.error(error ?? "No data");
      throw error;
    }
    return data.contribution_answers.filter(
      (contrib) =>
        contrib.statuses &&
        contrib.statuses.length > 0 &&
        contrib.statuses[0].status === "TO_PUBLISH"
    );
  }

  async updateCdtnId(id: string, cdtnId: string | null): Promise<void> {
    const { error } = await this.client.mutation<FetchContribPkData>(
      updatePublicationMutation,
      {
        id,
        cdtnId,
      }
    );
    if (error) {
      throw error;
    }
  }
}
