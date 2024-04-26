import { ApiClient } from "src/lib/api";
import {
  documentsDeleteMutation,
  documentsPublishMutation,
} from "./documents.mutation";
import {
  DocumentsQueryBySlugProps,
  DocumentsQueryProps,
  queryDocument,
  queryDocumentBySlug,
} from "./documents.query";
import { Document } from "@socialgouv/cdtn-types";

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

  async update(document: Document<any>): Promise<string | undefined> {
    try {
      const { data, error } = await this.client.mutation<
        any,
        { upsert: Document<any> }
      >(documentsPublishMutation, { upsert: document });
      if (error) {
        console.log("Error while updating document: ", document.cdtn_id, error);
        throw error;
      }
      const { cdtn_id: cdtnId } = data.insert_documents_one;
      return cdtnId;
    } catch (error) {
      console.log("Error while updating document: ", document.cdtn_id, error);
      throw error;
    }
  }

  async remove(id: string): Promise<string | undefined> {
    try {
      const { data, error } = await this.client.mutation<any>(
        documentsDeleteMutation,
        { id }
      );
      if (error) {
        console.log("Error while removing document: ", id, error);
        throw error;
      }
      console.log(`Document with id ${id} deleted ${data.affected_rows}`);
      return id;
    } catch (error) {
      console.log("Error while removing document: ", id, error);
      throw error;
    }
  }

  async fetchDocumentBySlug(variables: DocumentsQueryBySlugProps) {
    try {
      return await queryDocumentBySlug(this.client, variables);
    } catch (e) {
      throw e;
    }
  }
}
