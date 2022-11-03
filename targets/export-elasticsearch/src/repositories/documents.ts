import { client } from "@shared/graphql-client";
import type { Documents } from "@shared/types";
import { injectable } from "inversify";

import { name } from "../utils";
import { getDocumentsUpdatedGte } from "./graphql";

@injectable()
@name("DocumentsRepository")
export class DocumentsRepository {
  public async getDocumentsUpdatedGte(date: Date): Promise<Documents[]> {
    const res = await client
      .query<{ documents: Documents[] }>(getDocumentsUpdatedGte, { date })
      .toPromise();
    if (res.error) {
      throw res.error;
    }
    if (!res.data?.documents) {
      throw new Error("Failed to get, undefined object");
    }
    return res.data.documents;
  }
}
