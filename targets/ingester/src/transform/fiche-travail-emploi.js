import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";

import { getJson } from "../lib/getJson.js";
import {
  articleToReference,
  referenceResolver,
} from "../lib/referenceResolver";

/**
 *
 * @param {string} pkgName
 * @returns {Promise<ingester.FicheTravailEmploi[]>}
 */
export default async function getFicheTravailEmploi(pkgName) {
  const [fichesMT, cdt] = await Promise.all([
    /** @type {Promise<import("@socialgouv/fiches-travail-data-types").FicheTravailEmploi[]>} */
    (getJson(`${pkgName}/data/fiches-travail.json`)),
    /** @type {Promise<import("@socialgouv/legi-data-types").Code>} */
    (getJson(`@socialgouv/legi-data/data/LEGITEXT000006072050.json`)),
  ]);
  const resolveCdtReference = referenceResolver(cdt);
  return fichesMT.map(({ pubId, sections, ...content }) => {
    return {
      id: pubId,
      ...content,
      is_searchable: true,
      sections: sections.map(({ references, ...section }) => ({
        ...section,
        references: Object.keys(references).flatMap((key) => {
          if (key !== "LEGITEXT000006072050") {
            return [];
          }
          const { articles } = references[key];
          return articles.flatMap(({ id }) => {
            const [
              article,
            ] = /**@type {import("@socialgouv/legi-data-types").CodeArticle[]}*/ (resolveCdtReference(
              id
            ));
            if (!article) {
              return [];
            }
            return articleToReference(article);
          });
        }),
      })),
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
