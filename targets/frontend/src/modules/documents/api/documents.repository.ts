import { ApiClient } from "src/lib/api";
import { documentsPublishMutation } from "./documents.mutation";
import { queryDocument, DocumentsQueryProps } from "./documents.query";
import { Document } from "../type";

export class DocumentsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async fetch(variables: DocumentsQueryProps) {
    try {
      return await queryDocument(this.client, variables);
    } catch (e) {
      throw e;
    }
  }

  async update(document: Document): Promise<string | undefined> {
    try {
      const { data, error } = await this.client.mutation<
        any,
        { upsert: Document }
      >(documentsPublishMutation, { upsert: document });
      if (error) {
        console.log("Error: ", error);
        throw error;
      }
      const { cdtn_id: cdtnId } = data.insert_documents_one;
      return cdtnId;
    } catch (error) {
      console.log("Error: ", error);
      throw error;
    }
  }
}
