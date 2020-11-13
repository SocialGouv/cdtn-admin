import { client } from "@shared/graphql-client";

const query = `
query vdd {
  documents(where: {is_available: {_eq: true}, source: {_eq: "fiches_service_public"}}) {
    id: initial_id
  }
}`;

export async function getFicheServicePublicIds() {
  /** @type {import("urql").OperationResult} */
  const result = await client.query(query).toPromise();
  if (result.error) {
    throw result.error;
  }
  return result.data.documents.map((/** @type {{id:string}}*/ data) => data.id);
}
