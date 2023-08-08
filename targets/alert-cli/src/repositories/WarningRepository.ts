import { Client } from "@urql/core/dist/types/client";

const insertAlertsMutation = `
mutation insertAlertWarning($content: String!) {
  insert_alert_warnings(objects: {content: $content}) {
    affected_rows
  }
}
`;

interface InsertWarning {
  content: string;
}

export class WarningRepository {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async saveWarning(content: string) {
    const result = await this.client
      .mutation<InsertWarning>(insertAlertsMutation, { content })
      .toPromise();
    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error(`Failed to insert warning: ${result.error}`);
    }
  }
}
