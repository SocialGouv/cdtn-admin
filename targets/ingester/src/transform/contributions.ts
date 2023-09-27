import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { CdtnDocument } from "../index";
import { AnswerWithCC } from "../index";
import fetchContributions from "../lib/fetchContributions";

const mapConventionAnswers = (answers: AnswerWithCC[]) => {
  return answers.map((a) => {
    return {
      idcc: a.idcc,
      contentType: a.contentType,
    };
  });
};
export default async function getContributionsDocuments(): Promise<
  CdtnDocument[]
> {
  const data = await fetchContributions();

  return data.flatMap(({ title, answers, id }) => {
    const allAnswers = {
      answer: answers.generic,
      conventions: mapConventionAnswers(answers.conventions),
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
          description: answers.generic.description, // TODO: mettre une description unique qui contient l'idcc
          id: conventionalAnswer.id,
          is_searchable: false, // on laisse comme ça ?
          slug: slugify(`${parseInt(idcc, 10)}-${title}`),
          source: SOURCES.CONTRIBUTIONS,
          text: `${idcc} ${title}`, // actuellement c'est comme ça mais si la CC à son propre contenu est-ce que ça ne devrait pas être dans text aussi ?
          title,
        };
      }
    );

    return [allAnswers, ...ccnAnswers];
  });
}
