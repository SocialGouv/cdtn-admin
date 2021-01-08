import slugify from "@socialgouv/cdtn-slugify";
import cdtnSources from "@socialgouv/cdtn-sources";

import { getJson } from "../lib/getJson.js";

const { SOURCES } = cdtnSources;

/**
 *
 * @param {string} pkgName
 * @returns {Promise<ingester.Contribution[]>}
 */
export default async function getContributionsDocuments(pkgName) {
  /** @type {import("@socialgouv/contributions-data-types").Question[]} */
  const data = await getJson(`${pkgName}/data/contributions.json`);

  /** @type {import("@socialgouv/kali-data-types").IndexedAgreement[]} */
  const agreements = await getJson(`@socialgouv/kali-data/data/index.json`);

  return data.flatMap(({ title, answers, id, index }) => {
    const allAnswers = {
      answers,
      description: (answers.generic && answers.generic.description) || title,
      id,
      index,
      is_searchable: true,
      slug: slugify(title),
      source: SOURCES.CONTRIBUTIONS,
      text: (answers.generic && answers.generic.text) || title,
      title,
    };
    const ccnAnswers = answers.conventions.map((conventionalAnswer) => {
      const agreement = agreements.find(
        (ccn) => ccn.num === parseInt(conventionalAnswer.idcc, 10)
      );
      return {
        answers: {
          conventionAnswer: {
            ...conventionalAnswer,
            shortName:
              (agreement && agreement.shortTitle) ||
              `err - no ccn found for ${conventionalAnswer.idcc}`,
          },
          generic: answers.generic,
        },
        description: (answers.generic && answers.generic.description) || title,
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
