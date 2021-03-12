import { client } from "@shared/graphql-client";
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

const getFicheIdsQuery = `
query {
  ficheIds: service_public_contents(order_by: [{id: asc}]) {
    id
  }
}`;

const updateStatusMutation = `
mutation updateStatus($ids: [String!],$status: String) {
  update_service_public_contents(_set:{status: $status} where: {
    id: {_in: $ids}
  }) {
    affected_rows
  }
}
`;

/**
 *
 * @param {string} pkgName
 */
export default async function getFichesServicePublic(pkgName) {
  const [contributions, ficheVddIndex, agreements, cdt] = await Promise.all([
    /** @type {Promise<import("@socialgouv/contributions-data-types").Question[]>} */
    (getJson("@socialgouv/contributions-data/data/contributions.json")),
    /** @type {Promise<import("@socialgouv/fiches-vdd-types").FicheIndex[]>} */
    (getJson("@socialgouv/fiches-vdd/data/index.json")),
    /** @type {Promise<import("@socialgouv/kali-data-types").IndexedAgreement[]>} */
    (getJson("@socialgouv/kali-data/data/index.json")),
    /** @type {Promise<import("@socialgouv/legi-data-types").Code>} */
    getJson(`@socialgouv/legi-data/data/LEGITEXT000006072050.json`),
  ]);

  const resolveCdtReference = referenceResolver(cdt);

  /** @type {import("@shared/graphql-client").OperationResult<{ficheIds: {id: string}[]}>} */
  const results = await client.query(getFicheIdsQuery).toPromise();

  if (results.error) {
    console.error(results.error);
    throw new Error(`error while retrieving ingester packages version`);
  }

  const includeFicheId = results.data?.ficheIds.map(({ id }) => id) || [];

  const listFicheVdd = filter(includeFicheId, ficheVddIndex);

  const unknonwFiches = includeFicheId.filter((id) =>
    listFicheVdd.every((fiche) => fiche.id !== id)
  );
  await client
    .mutation(updateStatusMutation, { ids: unknonwFiches, status: "unknown" })
    .toPromise();

  const knonwFiches = includeFicheId.filter((id) =>
    listFicheVdd.some((fiche) => fiche.id === id)
  );
  await client
    .mutation(updateStatusMutation, { ids: knonwFiches, status: "done" })
    .toPromise();

  const fichesIdFromContrib = contributions.flatMap(({ answers }) => {
    const url = extractMdxContentUrl(answers.generic.markdown);
    if (url) {
      const [, id] = /** @type {RegExpMatchArray} */ (url.match(/\/(\w+)$/));
      return id;
    }
    return [];
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
      is_searchable: !fichesIdFromContrib.includes(ficheSp.id),
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
