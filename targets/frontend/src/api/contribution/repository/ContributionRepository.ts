import {
  contributionAnswerQuery,
  ContributionAnswerRequest,
  ContributionAnswerResponse,
} from "./answer.query";
import { ContributionAnswer } from "./types";
import { Status } from "../../../components/contributions";
import { ApiClient } from "../../ApiClient";
import {
  contributionAnswerPublishMutation,
  ContributionAnswerPublishRequest,
  ContributionAnswerPublishResponse,
} from "./answer.mutation";

type DocumentData = {
  initialId: string;
  document: string;
  slug: string;
  text: string;
  title: string;
  metaDescription: string;
};

export class ContributionRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetchAnswer(id: string): Promise<ContributionAnswer | null> {
    const result = await this.client.query<
      ContributionAnswerResponse,
      ContributionAnswerRequest
    >(contributionAnswerQuery, {
      id,
    });
    if (result.error) {
      console.log("Error: ", result.error);
      throw result.error;
    }
    if (!result.data) {
      throw new Error("");
    }
    if (result.data.contribution_answers.length === 0) {
      return null;
    }
    const answer = result.data.contribution_answers[0];
    return {
      id: answer.id,
      status:
        answer.statuses.length > 0 ? answer.statuses[0].status : Status.TODO,
    };
  }

  async publish(answerId: string, documentData: DocumentData): Promise<string> {
    const result = await this.client.mutation<
      ContributionAnswerPublishResponse,
      ContributionAnswerPublishRequest
    >(contributionAnswerPublishMutation, {
      answerId,
      ...documentData,
    });
    if (result.error) {
      console.log("Error: ", result.error);
      throw result.error;
    }
    if (!result.data) {
      throw new Error("");
    }
    return result.data.insert_contribution_answer_statuses_one.id;
  }
}
