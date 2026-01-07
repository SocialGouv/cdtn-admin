import { ApiClient } from "src/lib/api";
import {
  documentsDeleteByCdtnIdMutation,
  documentsDeleteBySourceAndInitialIdMutation,
  documentsDeleteMutation,
  documentsPublishMutation,
} from "./documents.mutation";
import {
  DocumentsQueryBySlugProps,
  DocumentsQueryBySourceProps,
  DocumentsQueryProps,
  queryDocument,
  queryDocumentBySlug,
  queryDocumentsBySource,
} from "./documents.query";
import { HasuraDocument } from "@socialgouv/cdtn-types";

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

  async fetchBySource(variables: DocumentsQueryBySourceProps) {
    try {
      return await queryDocumentsBySource(this.client, variables);
    } catch (e) {
      throw e;
    }
  }

  async update(document: HasuraDocument<any>): Promise<string | undefined> {
    try {
      const { data, error } = await this.client.mutation<
        any,
        { upsert: HasuraDocument<any> }
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

  async removeBySourceAndInitialId(props: {
    source: string;
    initialId: string;
  }): Promise<number> {
    try {
      const { data, error } = await this.client.mutation<
        { delete_documents: { affected_rows: number } },
        { source: string; initialId: string }
      >(documentsDeleteBySourceAndInitialIdMutation, props);

      if (error) {
        console.log(
          "Error while removing document by source+initialId: ",
          props,
          error
        );
        throw error;
      }

      return data?.delete_documents?.affected_rows ?? 0;
    } catch (error) {
      console.log(
        "Error while removing document by source+initialId: ",
        props,
        error
      );
      throw error;
    }
  }

  async removeByCdtnId(cdtnId: string): Promise<string | undefined> {
    try {
      const { data, error } = await this.client.mutation<any>(
        documentsDeleteByCdtnIdMutation,
        { cdtnId }
      );
      if (error) {
        console.log("Error while removing document: ", cdtnId, error);
        throw error;
      }
      return data?.delete_documents_by_pk?.cdtn_id;
    } catch (error) {
      console.log("Error while removing document: ", cdtnId, error);
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
