import { DocumentElasticWithSource } from "./common";
import { NewsTemplateDoc, NewsTemplateReference } from "../hasura";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { LinkedContent } from "./related-items";

export type NewsElasticDocument = DocumentElasticWithSource<
  NewsHasuraDoc,
  typeof SOURCES.NEWS
>;

export type NewsElasticLink =
  | ({ type: "cdtn" } & LinkedContent)
  | { type: "external"; title: string; url: string };

export type NewsHasuraDoc = Omit<
  NewsTemplateDoc,
  "cdtnReferences" | "links" | "references"
> & {
  linkedContent: LinkedContent[];
  links: NewsElasticLink[];
  references: NewsTemplateReference[];
};
