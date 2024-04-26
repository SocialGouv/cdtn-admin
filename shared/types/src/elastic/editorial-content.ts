import { EditorialContentDoc } from "../hasura";
import { KeysToCamelCase } from "../utility";
import { DocumentElasticWithSource } from "./common";

export type EditorialContentElasticDocument = DocumentElasticWithSource<
  KeysToCamelCase<EditorialContentDoc>
>;
