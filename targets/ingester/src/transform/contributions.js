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

  return data.flatMap(({ title, answers, id, index }) => {
    const allAnswers = {
      answers,
      description: (answers.generic && answers.generic.description) || title,
      id,
      index,
      slug: slugify(title),
      source: SOURCES.CONTRIBUTIONS,
      text: (answers.generic && answers.generic.text) || title,
      title,
    };
    const ccnAnswers = answers.conventions.map((conventionalAnswer) => {
      return {
        answers: {
          conventions: [conventionalAnswer],
          generic: answers.generic,
        },
        description: (answers.generic && answers.generic.description) || title,
        excludeFromSearch: true,
        id: conventionalAnswer.id,
        index,
        slug: slugify(`${parseInt(conventionalAnswer.idcc, 10)}-${title}`),
        source: SOURCES.CONTRIBUTIONS,
        text: `${conventionalAnswer.idcc} ${title}`,
        title,
      };
    });

    return [allAnswers, ...ccnAnswers];
  });
}
