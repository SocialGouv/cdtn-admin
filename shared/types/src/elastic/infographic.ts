import { DocumentElasticWithSource } from "./common";
import { HasuraDocument, InfographicTemplateDoc } from "../hasura";
import { SOURCES } from "@socialgouv/cdtn-utils";
import { LinkedContent } from "./related-items";

export type InfographicElasticDocument = DocumentElasticWithSource<
  InfographicHasuraDoc,
  typeof SOURCES.INFOGRAPHICS
>;

export type InfographicHasuraDoc = Omit<
  InfographicTemplateDoc,
  "cdtnReferences"
> & {
  linkedContent: LinkedContent[];
};
