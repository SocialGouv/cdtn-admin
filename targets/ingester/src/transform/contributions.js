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
  /** @type {import("@socialgouv/contributions-data").Question[]} */
  const data = await getJson(`${pkgName}/data/contributions.json`);

  return data.map(({ title, answers, id, index }) => {
    return {
      answers: {
        ...answers,
        generic: {
          ...answers.generic,
          markdown: answers.generic.markdown,
        },
      },
      description: (answers.generic && answers.generic.description) || title,
      id,
      index,
      slug: slugify(title),
      source: SOURCES.CONTRIBUTIONS,
      text: (answers.generic && answers.generic.text) || title,
      title,
    };
  });
}
