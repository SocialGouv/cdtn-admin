import { Client } from "@urql/core/dist/types/client";

const insertAlertsMutation = `
mutation insertAlertWarning($article: String!, $document: String!, $source: String!) {
  insert_alert_warnings(objects: {article: $article, document: $document, source: $source}) {
    affected_rows
  }
}
`;

interface InsertWarning {
  article: string;
  document: string;
  source: string;
}

export class WarningRepository {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async saveWarning({ article, document, source }: InsertWarning) {
    const result = await this.client
      .mutation<InsertWarning>(insertAlertsMutation, {
        article,
        document,
        source,
      })
      .toPromise();
    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error(`Failed to insert warning: ${result.error}`);
    }
  }
}
