import slugify from "@socialgouv/cdtn-slugify";
import cdtnSources from "@socialgouv/cdtn-sources";
import find from "unist-util-find";
import parents from "unist-util-parents";

import { getJson } from "../lib/getJson.js";

const { SOURCES, getRouteBySource } = cdtnSources;

/**
 *
 * @param {string} pkgName
 * @returns {Promise<ingester.FicheTravailEmploi[]>}
 */
export default async function getFicheTravailEmploi(pkgName) {
  const [fichesMT, cdt] = await Promise.all([
    /** @type {Promise<import("@socialgouv/fiches-travail-data").FicheTravailEmploi[]>} */
    (getJson(`${pkgName}/data/fiches-travail.json`)),
    /** @type {Promise<import("@socialgouv/legi-data").Code>} */
    (getJson(`@socialgouv/legi-data/data/LEGITEXT000006072050.json`)),
  ]);

  return fichesMT.map(({ pubId, sections, ...content }) => {
    return {
      id: pubId,
      ...content,
      sections: fixReferences(sections, parents(cdt)),
      slug: slugify(content.title),
      source: SOURCES.SHEET_MT_PAGE,
      /**
       * text is empty here because text used for search (in elasticsearch)
       * is in each sections and sections will be transform as searchable document
       */
      text: "",
    };
  });
}

/**
 *
 * @param {import("@socialgouv/fiches-travail-data").TravailEmploiSection[]} sections
 * @param {import("unist-util-parents").RootNodeWithParent<import("@socialgouv/legi-data").Code>} cdt
 * @returns {ingester.TravailEmploiSection[]}
 */
function fixReferences(sections, cdt) {
  return sections.map(({ references, ...section }) => ({
    ...section,
    references: Object.keys(references).flatMap((key) => {
      if (key !== "LEGITEXT000006072050") {
        return [];
      }
      const { articles } = references[key];
      return articles.map(({ id }) => {
        const article = find(
          cdt,
          (node) => node.type === "article" && node.data.id === id
        );
        return {
          id: article.data.id,
          title: `Article ${article.data.id} du code du travail`,
          type: getRouteBySource(SOURCES.CDT),
          url: `https://www.legifrance.gouv.fr/codes/section_lc/LEGITEXT000006072050/${article.parent.data.id}/#${article.data.id}`,
        };
      });
    }),
  }));
}
