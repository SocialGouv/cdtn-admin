import { DocumentElasticWithSource } from "./common";
import { InfographicTemplateDoc } from "../hasura/infographic";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type InfographicElasticDocument = DocumentElasticWithSource<
  InfographicTemplateDoc,
  typeof SOURCES.INFOGRAPHICS
>;
