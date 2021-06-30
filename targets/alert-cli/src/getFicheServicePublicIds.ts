import { client } from "@shared/graphql-client";

const query = `
query vdd {
  documents(where: { source: {_eq: "fiches_service_public"}}) {
    id: initial_id
  }
}`;

export type FicheServicePublicIdsResult = {
  documents: {
    id: string;
  }[];
};

export async function getFicheServicePublicIds(): Promise<string[]> {
  const result = await client
    .query<FicheServicePublicIdsResult>(query)
    .toPromise();
  if (result.error || !result.data) {
    console.error(result.error);
    throw new Error("can't retrieve fiche serive public IDs");
  }
  return result.data.documents.map((data) => data.id);
}
