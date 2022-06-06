import type { Question } from "@shared/types";

import { AgreementRepository } from "./AgreementRepository";
import { AnswerExtractor } from "./AnswerExtractor";
import { ContributionRepository } from "./ContributionRepository";

/**
 *
 * Fetch contributions from the contributions api
 * retrieve all the answers, questions, references
 * resolve CCN references by IDCC from @socialgouv/kali-data
 *
 */
async function fetchContributions(): Promise<Question[]> {
  const contributionRepository = new ContributionRepository();
  const agreementRepository = new AgreementRepository();
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
