import { PrequalifiedDoc } from "../hasura";
import { DocumentElasticWithSource, RelatedDocument } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type PrequalifiedElasticDocument = Omit<
  DocumentElasticWithSource<PrequalifiedDoc, typeof SOURCES.PREQUALIFIED>,
  "slug" | "refs"
> & {
  refs: RelatedDocument[];
};
