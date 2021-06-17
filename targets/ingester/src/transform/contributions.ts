import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import type { IndexedAgreement } from "@socialgouv/kali-data-types";

import { getJson } from "../lib/getJson";

export default async function getContributionsDocuments(pkgName: string) {
  const data = await getJson<ContributionsData.Question[]>(
    `${pkgName}/data/contributions.json`
  );

  const agreements = await getJson<IndexedAgreement[]>(
    `@socialgouv/kali-data/data/index.json`
  );

  return data.flatMap(({ title, answers, id, index }) => {
    const allAnswers = {
      answers,
      description: answers.generic.description,
      id,
      index,
      is_searchable: true,
      slug: slugify(title),
      source: SOURCES.CONTRIBUTIONS,
      text: answers.generic.text || title,
      title,
    };
    const ccnAnswers = answers.conventions.map((conventionalAnswer) => {
      const agreement = agreements.find(
        (ccn) => ccn.num === parseInt(conventionalAnswer.idcc, 10)
      );
      if (agreement === undefined) {
        throw new Error(`err - no ccn found for ${conventionalAnswer.idcc}`);
      }
      return {
        answers: {
          conventionAnswer: {
            ...conventionalAnswer,
            shortName: agreement.shortTitle,
          },
          generic: answers.generic,
        },
        description: answers.generic.description,
        id: conventionalAnswer.id,
        index,
        is_searchable: false,
        slug: slugify(`${parseInt(conventionalAnswer.idcc, 10)}-${title}`),
        source: SOURCES.CONTRIBUTIONS,
        split: true, // convenient way to know if a document is a split version of another
        text: `${conventionalAnswer.idcc} ${title}`,
        title,
      };
    });

    return [allAnswers, ...ccnAnswers];
  });
}
