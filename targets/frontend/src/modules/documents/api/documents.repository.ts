import { ApiClient } from "src/lib/api";
import { documentsPublishMutation } from "./documents.mutation";
import { queryDocument, getDocumentsUpdatedAfterDateQuery, DocumentsQueryProps } from "./documents.query";
import { Document, ShortDocument } from "../type";
import { SOURCES } from "@socialgouv/cdtn-sources";

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

  async getUpdatedAfter(date: Date): Promise<ShortDocument[]> {
    const { error, data } = await this.client.query<
      { documents: [] },
      { updated_at: Date; sources: string[] }
    >(getDocumentsUpdatedAfterDateQuery, {
      updated_at: date,
      sources: [SOURCES.LETTERS, SOURCES.EDITORIAL_CONTENT],
    });

    if (error) {
      console.log("Error: ", error);
      throw error;
    }
    if (!data || data.documents.length === 0) {
      return [];
    }
    return data.documents;
  }
}
