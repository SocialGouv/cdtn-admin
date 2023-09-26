import { ApiClient } from "src/lib/api";
import { documentsPublishMutation } from "./documents.mutation";
import { DocumentRaw } from "../type";

export class DocumentsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async update(document: DocumentRaw): Promise<String | undefined> {
    try {
      const { data, error } = await this.client.mutation<
        any,
        { upsert: DocumentRaw }
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
