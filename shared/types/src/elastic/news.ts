import { DocumentElasticWithSource } from "./common";
import { HasuraDocument, NewsTemplateDoc } from "../hasura";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { LinkedContent } from "./related-items";

export type NewsElasticDocument = DocumentElasticWithSource<
  NewsHasuraDoc,
  typeof SOURCES.NEWS
>;

export type NewsHasuraDoc = Omit<NewsTemplateDoc, "cdtnReferences"> & {
  linkedContent: LinkedContent[];
};
