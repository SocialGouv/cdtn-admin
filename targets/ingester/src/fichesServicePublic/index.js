import slugify from "@socialgouv/cdtn-slugify";
import contributions from "@socialgouv/contributions-data/data/contributions.json";
import externals from "@socialgouv/datafiller-data/data/externals.json";
import { getFiche } from "@socialgouv/fiches-vdd";

import { format } from "./format";

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

const fichesIdFromContrib = /** @type {import("@socialgouv/contributions-data").Question[]}*/ (contributions)
  .map(({ answers }) => extractMdxContentUrl(answers.generic.markdown))
  .filter(Boolean)
  .map((url) => {
    const [, id] = /** @type {string} */ (url).match(/\/(\w+)$/);
    return id;
  });

export function getFichesServicePublic() {
  const vddExternals = externals.find(
    ({ title }) => title === "service-public.fr"
  );

  if (!vddExternals || !vddExternals.urls.length) {
    throw new Error("fiches sp urls not found");
  }
  const fiches = vddExternals.urls.flatMap((url) => {
    const [, slugType, idFiche] =
      url.match(/([a-z-]+)\/vosdroits\/(F[0-9]+)$/) || [];
    if (!Object.prototype.hasOwnProperty.call(slugMap, slugType) || !idFiche) {
      throw new Error(`Unknown fiche ${url}`);
    }
    let fiche;
    try {
      fiche = getFiche(
        slugMap[/** @type { keyof slugMap } */ (slugType)],
        idFiche
      );
    } catch (err) {
      console.error(url);
      return [];
    }

    const ficheSp = format(fiche);

    if (!ficheSp) return [];

    return [
      {
        ...ficheSp,
        excludeFromSearch: fichesIdFromContrib.includes(ficheSp.id),
        slug: slugify(ficheSp.title),
      },
    ];
  });

  fichesIdFromContrib.forEach((idFiche) => {
    if (fiches.find(({ id }) => idFiche === id) === undefined) {
      throw Error(
        `[FICHE-SP] The ${idFiche} from service-public is embeded in a contribution and was not found`
      );
    }
  });
  return fiches;
}

if (module === require.main) {
  console.log(JSON.stringify(getFichesServicePublic(), null, 2));
}
