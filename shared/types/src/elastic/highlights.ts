import { Highlight } from "../hasura";
import { DocumentElasticWithSource } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type HighlightDocument = DocumentElasticWithSource<
  Highlight,
  typeof SOURCES.HIGHLIGHTS
>;
