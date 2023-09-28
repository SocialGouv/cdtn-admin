import type { AgreementRepository } from "./AgreementRepository";
import { AgreementFile } from "./AgreementRepository";
import { AnswerExtractor } from "./AnswerExtractor";
import type { ContributionRepository } from "./ContributionRepository";
import { ContributionDatabase } from "./ContributionRepository";
import { AnswerRaw } from "./types";
import { Question } from "../../index";

const filterOutAnswerGeneric = (answers: AnswerRaw[]): AnswerRaw[] =>
  answers.filter((a) => a.agreement.id !== "0000");

const contributionRepository: ContributionRepository =
  new ContributionDatabase();
const agreementRepository: AgreementRepository = new AgreementFile();

/**
 *
 * Fetch contributions from the contributions api
 * retrieve all the answers, questions, references
 * resolve CCN references by IDCC from @socialgouv/kali-data
 *
 */
export async function fetchContributions(): Promise<Question[]> {
  const [questions, agreements] = await Promise.all([
    contributionRepository.fetchAll(),
    agreementRepository.fetchAll(),
  ]);
  const answerExtractor = new AnswerExtractor(agreements);

  return questions.flatMap(({ answers, ...question }) => {
    const genericAnswer = answerExtractor.extractGenericAnswer(answers);
    return {
      answers: {
        conventions: answerExtractor.extractAgreementAnswers(
          filterOutAnswerGeneric(answers)
        ),
        generic: genericAnswer,
      },
      order: question.order,
      title: question.content,
      id: question.id,
    };
  });
}

export async function fetchFicheSPIdsFromContributions(): Promise<string[]> {
  const result =
    await contributionRepository.fetchFicheSPIdsFromContributions();

  return result.map((a) => a.id);
}
