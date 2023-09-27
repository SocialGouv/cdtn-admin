import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";

import type { CdtnDocument } from "../index";
import fetchContributions from "../lib/fetchContributions";
import { Answer } from "@shared/types";

const mapConventionAnswers = (answers: Answer[]) => {
  return answers.map((a: Answer) => {
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

  return data.flatMap(({ title, answers, id, index }) => {
    const allAnswers = {
      answers: {
        generic: answers.generic,
        conventions: mapConventionAnswers(answers.conventions),
      },
      description: answers.generic.description,
      id,
      index,
      is_searchable: true,
      slug: slugify(title),
      source: SOURCES.CONTRIBUTIONS,
      text: answers.generic.text || title, // TODO : remove after convention page is done
      title,
    };
    const ccnAnswers = answers.conventions.map((conventionalAnswer) => {
      return {
        answer: conventionalAnswer,
        idcc: conventionalAnswer.idcc,
        id: conventionalAnswer.id,
        index,
        description: answers.generic.description, // TODO: mettre une description unique qui contient l'idcc
        is_searchable: false, // on laisse comme ça ?
        slug: slugify(`${parseInt(conventionalAnswer.idcc, 10)}-${title}`),
        source: SOURCES.CONTRIBUTIONS,
        text: `${conventionalAnswer.idcc} ${title}`,
        title,
      };
    });

    return [allAnswers, ...ccnAnswers];
  });
}
