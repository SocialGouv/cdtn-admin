import { Client } from "@urql/core/dist/types/client";
import { Source } from "../types";

const sourcesQuery = `
query getSources {
  sources(order_by: {label: asc}) {
    repository
    tag
  }
}
`;

interface SourceResult {
  sources: {
    repository: string;
    tag: string;
  }[];
}

const updateSourceMutation = `
mutation updateSource($repository: String!, $tag: String!){
  source: update_sources_by_pk(
    _set:{
      tag: $tag
    },
    pk_columns: {
      repository: $repository
    }
  ){
    repository, tag
  }
}
`;

interface UpdateSourceResult {
  source: {
    repository: string;
    tag: string;
  };
}

export class SourcesRepository {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async load() {
    const result = await this.client
      .query<SourceResult>(sourcesQuery)
      .toPromise();
    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error("getSources");
    }
    const sources = result.data.sources;
    return sources.filter((source) => source.repository !== "dares");
  }

  async updateSource(repository: string, tag: string): Promise<Source> {
    const result = await this.client
      .mutation<UpdateSourceResult>(updateSourceMutation, {
        repository,
        tag,
      })
      .toPromise();

    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error("updateSource");
    }
    return result.data.source;
  }
}
