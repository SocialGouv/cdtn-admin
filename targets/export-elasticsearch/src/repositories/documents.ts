import { client } from "@shared/graphql-client";
import { logger } from "@socialgouv/cdtn-logger";
import { injectable } from "inversify";

import { name } from "../utils";
import { getDocumentBySource } from "./graphql";
import { DocumentRepo } from "../type";

@injectable()
@name("DocumentsRepository")
export class DocumentsRepository {
  public async getBySource(source: string): Promise<DocumentRepo[]> {
    try {
      const res = await client
        .query<{ documents: DocumentRepo[] }>(getDocumentBySource, {
          source,
        })
        .toPromise();
      if (res.error) {
        throw res.error;
      }
      if (!res.data?.documents) {
        throw new Error("Failed to get, undefined object");
      }
      return res.data.documents;
    } catch (e) {
      logger.error(e);
      throw e;
    }
  }
}
