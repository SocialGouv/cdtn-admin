import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { CdtnDocument } from "../index";
import { AnswerWithCC } from "../index";
import fetchContributions from "../lib/fetchContributions";

const mapConventionAnswers = (answers: AnswerWithCC[]): string[] => {
  return answers
    .filter((a) => a.contentType === "ANSWER" || a.contentType === "NOTHING")
    .map((a) => a.idcc);
};
export default async function getContributionsDocuments(): Promise<
  CdtnDocument[]
> {
  const data = await fetchContributions();

  return data.flatMap(({ title, answers, id }) => {
    const allAnswers = {
      answer: answers.generic,
      agreementsWithAnswer: mapConventionAnswers(answers.conventions),
      description: answers.generic.description,
      id,
      is_searchable: true,
      slug: slugify(title),
      source: SOURCES.CONTRIBUTIONS,
      text: answers.generic.text || title,
      title,
    };
    const ccnAnswers = answers.conventions.map(
      ({ idcc, shortName, ...conventionalAnswer }) => {
        return {
          answer: conventionalAnswer,
          idcc: idcc,
          shortName: shortName,
          description: answers.generic.description, // TODO: mettre une description unique qui contient le nom de la CC
          id: conventionalAnswer.id,
          is_searchable: false,
          slug: slugify(`${parseInt(idcc, 10)}-${title}`),
          source: SOURCES.CONTRIBUTIONS,
          text: `${idcc} ${title}`, // actuellement c'est comme ça mais si la CC a son propre contenu est-ce que ça ne devrait pas être dans text aussi ?
          title,
        };
      }
    );

    return [allAnswers, ...ccnAnswers];
  });
}
