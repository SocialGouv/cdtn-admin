import { gqlClient, logger } from "@shared/utils";
import { injectable } from "inversify";

import { name } from "../utils";
import {
  fetchDocumentQuery,
  getGlossaryQuery,
  updateDocumentWithCdtnIdMutation,
} from "./graphql";
import { Glossary, HasuraDocument } from "@socialgouv/cdtn-types";
import { SourceKeys } from "@socialgouv/cdtn-utils";

interface HasuraReturnFetchDocumentBySource {
  documents: Pick<HasuraDocument<any>, "cdtn_id" | "document">[];
}

@injectable()
@name("GlossaryRepository")
export class GlossaryRepository {
  public async getGlossary(): Promise<Glossary> {
    const result = await gqlClient()
      .query<{ glossary: Glossary }>(getGlossaryQuery, {})
      .toPromise();
    if (result.error || !result.data) {
      console.error(result.error);
      throw new Error(
        `Error fetching glossary => ${JSON.stringify(result.error)}`
      );
    }
    return result.data.glossary;
  }

  public async fetchDocumentBySource(
    source: SourceKeys
  ): Promise<HasuraReturnFetchDocumentBySource["documents"]> {
    const res = await gqlClient()
      .query<HasuraReturnFetchDocumentBySource>(fetchDocumentQuery, { source })
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.documents.length) {
      logger.error("No contributions found");
      return [];
    }
    return res.data.documents;
  }

  public async updateDocument(cdtnId: string, document: any): Promise<void> {
    const res = await gqlClient()
      .mutation(updateDocumentWithCdtnIdMutation, {
        cdtnId,
        document,
      })
      .toPromise();
    if (res.error) {
      console.error(res.error);
      throw res.error;
    }
    return;
  }
}
