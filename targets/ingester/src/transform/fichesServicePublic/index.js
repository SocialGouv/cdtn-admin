import slugify from "@socialgouv/cdtn-slugify";

import { getJson } from "../../lib/getJson.js";
import { referenceResolver } from "../../lib/referenceResolver";
import { filter } from "./filter.js";
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

/**
 *
 * @param {string} pkgName
 */
export default async function getFichesServicePublic(pkgName) {
  const [contributions, externals, agreements, cdt] = await Promise.all([
    /** @type {Promise<import("@socialgouv/contributions-data-types").Question[]>} */
    (getJson("@socialgouv/contributions-data/data/contributions.json")),
    /** @type {Promise<import("@socialgouv/datafiller-data-types/src/externalDocs").ExternalDoc[]>} */
    (getJson("@socialgouv/datafiller-data/data/externals.json")),
    /** @type {Promise<import("@socialgouv/kali-data-types").IndexedAgreement[]>} */
    (getJson("@socialgouv/kali-data/data/index.json")),
    /** @type {Promise<import("@socialgouv/legi-data-types").Code>} */
    getJson(`@socialgouv/legi-data/data/LEGITEXT000006072050.json`),
  ]);

  const resolveCdtReference = referenceResolver(cdt);

  const listFicheVdd = filter(ficheVddIndex);

  const fichesIdFromContrib = contributions
    .map(({ answers }) => extractMdxContentUrl(answers.generic.markdown))
    .filter(Boolean)
    .map((url) => {
      const [, id] = /** @type {string} */ (url).match(/\/(\w+)$/);
      return id;
    });

  /** @type {ingester.FicheServicePublic[]} */
  const fiches = [];
  for (const { id: idFiche, type } of listFicheVdd) {
    let fiche;
    try {
      fiche = await getJson(`${pkgName}/data/${type}/${idFiche}.json`);
    } catch (err) {
      console.error(">", `${pkgName}/data/${type}/${idFiche}.json`);
      continue;
    }
    const ficheSp = format(fiche, resolveCdtReference, agreements);
    fiches.push({
      ...ficheSp,
      excludeFromSearch: fichesIdFromContrib.includes(ficheSp.id),
      slug: slugify(ficheSp.title),
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
