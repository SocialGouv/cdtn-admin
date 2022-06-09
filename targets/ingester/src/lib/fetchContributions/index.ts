import type { Question } from "@shared/types";

import type { AgreementRepository } from "./AgreementRepository";
import { AgreementFile } from "./AgreementRepository";
import { AnswerExtractor } from "./AnswerExtractor";
import type { ContributionRepository } from "./ContributionRepository";
import { ContributionDatabase } from "./ContributionRepository";

/**
 *
 * Fetch contributions from the contributions api
 * retrieve all the answers, questions, references
 * resolve CCN references by IDCC from @socialgouv/kali-data
 *
 */
async function fetchContributions(
  contributionRepository: ContributionRepository = new ContributionDatabase(),
  agreementRepository: AgreementRepository = new AgreementFile()
): Promise<Question[]> {
  const [questions, agreements] = await Promise.all([
    contributionRepository.fetchAll(),
    agreementRepository.fetchAll(),
  ]);
  const answerExtractor = new AnswerExtractor(agreements);

  return questions.flatMap(({ id, index, title, answers }) => {
    const genericAnswer = answerExtractor.extractGenericAnswer(answers);
    if (!genericAnswer) return [];
    return {
      answers: {
        conventions: answerExtractor.extractAgreementAnswers(answers),
        generic: genericAnswer,
      },
      id,
      index,
      title,
    };
  });
}

export default fetchContributions;
