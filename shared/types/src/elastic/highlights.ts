import { Highlight } from "../hasura";
import { DocumentElasticWithSource } from "./common";

export type HighlightDocument = DocumentElasticWithSource<
  Highlight,
  "highlights"
>;
