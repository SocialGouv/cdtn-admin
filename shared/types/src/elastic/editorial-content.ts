import { EditorialContentDoc } from "../hasura";
import { KeysToCamelCase } from "../utility";
import { DocumentElasticWithSource } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type EditorialContentElasticDocument = Omit<
  DocumentElasticWithSource<
    KeysToCamelCase<EditorialContentDoc>,
    typeof SOURCES.EDITORIAL_CONTENT
  >,
  "introWithGlossary"
>;
