import { PrequalifiedDoc } from "../hasura";
import { DocumentElasticWithSource, RelatedDocument } from "./common";

export type PrequalifiedElasticDocument = Omit<
  DocumentElasticWithSource<PrequalifiedDoc, "prequalified">,
  "slug" | "refs"
> & {
  refs: RelatedDocument[];
};
