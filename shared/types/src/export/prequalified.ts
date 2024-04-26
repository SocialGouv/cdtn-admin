import { DocumentElasticWithSource } from "./global";

type Prequalified = {
  source: "prequalified";
  variants: string[];
};

export type PrequalifiedElasticDocument = Omit<
  DocumentElasticWithSource<Prequalified>,
  "slug"
>;
