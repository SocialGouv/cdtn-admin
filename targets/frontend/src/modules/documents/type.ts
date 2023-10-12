import { SourceRoute } from "@socialgouv/cdtn-sources";

export type Document = {
  cdtn_id: string;
  initial_id: string;
  source: SourceRoute;
  document: any;
  slug: string;
  text: string;
  title: string;
  meta_description: string;
};

export type ShortDocument = Pick<
  Document,
  "source" | "slug" | "title" | "cdtn_id"
> & { isPublished: boolean };
