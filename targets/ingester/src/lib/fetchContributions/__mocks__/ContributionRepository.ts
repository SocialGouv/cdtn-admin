import type { QuestionRaw } from "../types";
import InputQuestions from "./input-questions.json";
import { ContributionRepository } from "../ContributionRepository";

export class ContributionDatabase implements ContributionRepository {
  async fetchAll(): Promise<QuestionRaw[]> {
    return Promise.resolve(InputQuestions as unknown as QuestionRaw[]);
  }

  async fetchFicheSPIdsFromContributions(): Promise<{ id: string }[]> {
    return Promise.resolve([{ id: "a708246e55" }]);
  }
}
