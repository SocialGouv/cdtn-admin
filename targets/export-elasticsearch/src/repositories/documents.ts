import { client } from "@shared/graphql-client";
import { logger } from "@socialgouv/cdtn-logger";
import { injectable } from "inversify";

import { name } from "../utils";
import { getDocumentBySource } from "./graphql";

interface Document {
  id: string;
  cdtnId: string;
  title: string;
  slug: string;
  source: string;
  text: string;
  isPublished: boolean;
  isSearchable: boolean;
  metaDescription: string;
  document: {
    raw: string;
    url: string;
    date: string;
    description: string;
    answers?: {
      generic?: {
        markdown: string;
      };
      conventionAnswer?: {
        markdown: string;
      };
    };
    referencedTexts?:
      | {
          slug: string;
          type: string;
          title: string;
        }[]
      | null;
  };
  __typename: string;
}

@injectable()
@name("DocumentsRepository")
export class DocumentsRepository {
  public async getBySource(source: string): Promise<Document[]> {
    try {
      const res = await client
        .query<{ documents: Document[] }>(getDocumentBySource, {
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
