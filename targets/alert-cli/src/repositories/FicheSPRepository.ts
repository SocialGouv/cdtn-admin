import { Client } from "@urql/core";

const query = `
query vdd {
  documents(where: { source: {_eq: "fiches_service_public"}}) {
    id: initial_id
  }
}`;

export interface FicheServicePublicIdsResult {
  documents: {
    id: string;
  }[];
}

export class FicheSPRepository {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async getFicheServicePublicIds(): Promise<string[]> {
    const result = await this.client
      .query<FicheServicePublicIdsResult>(query, {})
      .toPromise();
    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error("can't retrieve fiche serive public IDs");
    }
    return result.data.documents.map((data) => data.id);
  }
}
