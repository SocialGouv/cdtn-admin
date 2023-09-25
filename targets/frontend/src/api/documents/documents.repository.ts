import { ApiClient } from "../ApiClient";
import { DocumentsRequest, documentsMutation } from "./documents.mutation";
import { Document } from "src/components/documents";

export class DocumentsRepository {
  client: ApiClient;

  constructor(client: ApiClient) {
    this.client = client;
  }

  async update(document: Document): Promise<void> {
    const { data, error } = await this.client.mutation<any, DocumentsRequest>(
      documentsMutation,
      document
    );
    if (error) {
      console.log("Error: ", error);
      throw error;
    }
    console.log("data", data);
    return data;
  }
}
