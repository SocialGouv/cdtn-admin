import type { ContributionRepository } from "../ContributionRepository";
import type { QuestionRaw } from "../types";
import InputQuestions from "./input-questions.json";

export class ContributionMock implements ContributionRepository {
  async fetchAll(): Promise<QuestionRaw[]> {
    return Promise.resolve(InputQuestions as unknown as QuestionRaw[]);
  }
}
