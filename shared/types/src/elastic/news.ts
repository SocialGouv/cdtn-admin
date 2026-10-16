import { DocumentElasticWithSource } from "./common";
import {
  NewsTemplateDoc,
  NewsTemplateExternalLink,
  NewsTemplateReference,
} from "../hasura";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { LinkedContent } from "./related-items";

export type NewsElasticDocument = DocumentElasticWithSource<
  NewsHasuraDoc,
  typeof SOURCES.NEWS
>;

export type NewsElasticLink =
  | ({ type: "cdtn"; intro?: string } & LinkedContent)
  | NewsTemplateExternalLink;

export type NewsHasuraDoc = Omit<
  NewsTemplateDoc,
  "cdtnReferences" | "links" | "references"
> & {
  linkedContent: LinkedContent[];
  links: NewsElasticLink[];
  references: NewsTemplateReference[];
};
