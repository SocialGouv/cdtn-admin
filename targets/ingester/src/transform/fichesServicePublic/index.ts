import { client } from "@shared/graphql-client";
import slugify from "@socialgouv/cdtn-slugify";
import type { FicheIndex, RawJson } from "@socialgouv/fiches-vdd-types";
import type { IndexedAgreement } from "@socialgouv/kali-data-types";
import type { Code } from "@socialgouv/legi-data-types";

import type { FicheServicePublic } from "../../index";
import { fetchFicheSPIdsFromContributions } from "../../lib/fetchContributions";
import { getJson } from "../../lib/getJson";
import { createReferenceResolver } from "../../lib/referenceResolver";
import { filter } from "./filter";
import { format } from "./format";

const getFicheIdsQuery = `
query {
  ficheIds: service_public_contents(order_by: [{id: asc}]) {
    id
  }
}`;

interface FicheIdResult {
  ficheIds: { id: string }[];
}

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
  const [idsFromContributions, ficheVddIndex, agreements, cdt] =
    await Promise.all([
      fetchFicheSPIdsFromContributions(),
      getJson<FicheIndex[]>("@socialgouv/fiches-vdd/data/index.json"),
      getJson<IndexedAgreement[]>("@socialgouv/kali-data/data/index.json"),
      getJson<Code>(`@socialgouv/legi-data/data/LEGITEXT000006072050.json`),
    ]);

  const filteredAgreements = agreements.filter(
    (convention) => typeof convention.id === "string"
  );

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

  const fiches: FicheServicePublic[] = [];
  for (const { id: idFiche, type } of listFicheVdd) {
    let fiche = null;
    try {
      fiche = await getJson<RawJson>(`${pkgName}/data/${type}/${idFiche}.json`);
    } catch {
      console.error(">", `${pkgName}/data/${type}/${idFiche}.json`);
      continue;
    }

    const ficheSp = format(fiche, resolveCdtReference, filteredAgreements);

    fiches.push({
      ...ficheSp,
      is_searchable: !idsFromContributions.includes(ficheSp.id),
      slug: slugify(ficheSp.title),
    });
  }

  return fiches;
}
