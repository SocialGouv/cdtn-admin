import slugify from "@socialgouv/cdtn-slugify";
import parents from "unist-util-parents";

import { getJson } from "../../lib/getJson.js";
import { format } from "./format.js";
// Extract external content url from Content tag markdown
/**
 *
 * @param {string} markdown
 * @returns { string | null}
 */
function extractMdxContentUrl(markdown) {
  if (!markdown) return null;
  // Check Content tag exist on markdown
  const [, href = ""] = markdown.match(/<Content.*?href="([^"]+)".*?>/) || [];
  const matchUrl = href.match(
    /\bhttps?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)/gi
  );
  return matchUrl ? matchUrl[0] : null;
}

const slugMap = {
  associations: "associations",
  particuliers: "particuliers",
  "professionnels-entreprises": "professionnels",
};

/**
 *
 * @param {string} pkgName
 */
export default async function getFichesServicePublic(pkgName) {
  const [contributions, externals, agreements, cdt] = await Promise.all([
    /** @type {Promise<import("@socialgouv/contributions-data").Question[]>} */
    (getJson("@socialgouv/contributions-data/data/contributions.json")),
    /** @type {Promise<import("@socialgouv/datafiller-data").ExternalDoc[]>} */
    (getJson("@socialgouv/datafiller-data/data/externals.json")),
    /** @type {Promise<import("@socialgouv/kali-data").IndexedAgreement[]>} */
    (getJson("@socialgouv/kali-data/data/index.json")),
    /** @type {Promise<import("@socialgouv/legi-data").Code>} */
    getJson(`@socialgouv/legi-data/data/LEGITEXT000006072050.json`),
  ]);

  const fichesIdFromContrib = contributions
    .map(({ answers }) => extractMdxContentUrl(answers.generic.markdown))
    .filter(Boolean)
    .map((url) => {
      const [, id] = /** @type {string} */ (url).match(/\/(\w+)$/);
      return id;
    });

  const vddExternals = externals.find(
    ({ title }) => title === "service-public.fr"
  );

  if (!vddExternals || !vddExternals.urls.length) {
    throw new Error("fiches sp urls not found");
  }
  /** @type {ingester.FicheServicePublic[]} */
  const fiches = [];
  for (const url of vddExternals.urls) {
    const [, slugType, idFiche] =
      url.match(/([a-z-]+)\/vosdroits\/(F[0-9]+)$/) || [];
    if (!Object.prototype.hasOwnProperty.call(slugMap, slugType) || !idFiche) {
      // throw new Error(`Unknown fiche ${url}`);
      console.error(`[getFichesServicePublic] - error | Unknown fiche ${url}`);
      continue;
    }
    let fiche;
    try {
      fiche = await getJson(
        `${pkgName}/data/${
          slugMap[/** @type { keyof slugMap } */ (slugType)]
        }/${idFiche}.json`
      );
    } catch (err) {
      console.error(
        ">",
        `${pkgName}/data/${
          slugMap[/** @type { keyof slugMap } */ (slugType)]
        }/${idFiche}.json`,
        url
      );
      continue;
    }
    const ficheSp = format(fiche, parents(cdt), agreements);
    fiches.push({
      ...ficheSp,
      excludeFromSearch: fichesIdFromContrib.includes(ficheSp.id),
      slug: slugify(ficheSp.title),
      url,
    });
  }

  fichesIdFromContrib.forEach((idFiche) => {
    if (fiches.find(({ id }) => idFiche === id) === undefined) {
      throw Error(
        `[FICHE-SP] The ${idFiche} from service-public is embeded in a contribution and was not found`
      );
    }
  });

  return fiches;
}
