import { client } from "@shared/graphql-client";
import slugify from "@socialgouv/cdtn-slugify";
import type { Question } from "@socialgouv/contributions-data-types";
import type { FicheIndex, RawJson } from "@socialgouv/fiches-vdd-types";
import type { IndexedAgreement } from "@socialgouv/kali-data-types";
import type { Code } from "@socialgouv/legi-data-types";

import type { FicheServicePublic } from "../../index";
import { getJson } from "../../lib/getJson";
import { createReferenceResolver } from "../../lib/referenceResolver";
import { filter } from "./filter";
import { format } from "./format";

/**
 * Extract external content url from Content tag markdown
 */
function extractMdxContentUrl(markdown: string) {
  if (!markdown) return null;
  // Check Content tag exist on markdown
  const [, href = ""] = /<Content.*?href="([^"]+)".*?>/.exec(markdown) ?? [];
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

type FicheIdResult = {
  ficheIds: { id: string }[];
};

const updateStatusMutation = `
mutation updateStatus($ids: [String!],$status: String) {
  update_service_public_contents(_set:{status: $status} where: {
    id: {_in: $ids}
  }) {
    affected_rows
  }
}
`;

export default async function getFichesServicePublic(pkgName: string) {
  const [contributions, ficheVddIndex, agreements, cdt] = await Promise.all([
    getJson<Question[]>(
      "@socialgouv/contributions-data/data/contributions.json"
    ),
    getJson<FicheIndex[]>("@socialgouv/fiches-vdd/data/index.json"),
    getJson<IndexedAgreement[]>("@socialgouv/kali-data/data/index.json"),
    getJson<Code>(`@socialgouv/legi-data/data/LEGITEXT000006072050.json`),
  ]);

  const resolveCdtReference = createReferenceResolver(cdt);

  const results = await client
    .query<FicheIdResult>(getFicheIdsQuery)
    .toPromise();

  if (results.error) {
    console.error(results.error);
    throw new Error(`error while retrieving ingester packages version`);
  }
  let includeFicheId: string[] = [];

  if (results.data) {
    includeFicheId = results.data.ficheIds.map(({ id }) => id);
  }

  const listFicheVdd = filter(includeFicheId, ficheVddIndex);

  const unknonwFiches = includeFicheId.filter((id) =>
    listFicheVdd.every((fiche) => fiche.id !== id)
  );
  console.time("service-public updateStatus");
  await client
    .mutation(updateStatusMutation, { ids: unknonwFiches, status: "unknown" })
    .toPromise();
  console.timeEnd("service-public updateStatus");

  const fichesIdFromContrib = contributions.flatMap(({ answers }) => {
    const url = extractMdxContentUrl(answers.generic.markdown) ?? "";

    const [, id] = /\/(\w+)$/.exec(url) ?? [];
    if (id) {
      return id;
    }
    return [];
  });

  const fiches: FicheServicePublic[] = [];
  for (const { id: idFiche, type } of listFicheVdd) {
    let fiche = null;
    try {
      fiche = await getJson<RawJson>(`${pkgName}/data/${type}/${idFiche}.json`);
    } catch {
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
