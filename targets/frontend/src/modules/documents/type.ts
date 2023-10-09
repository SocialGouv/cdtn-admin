import { SourceRoute } from "@socialgouv/cdtn-sources";

export type Document = {
  cdtnId: string;
  initialId: string;
  source: SourceRoute;
  document: any;
  slug: string;
  text: string;
  title: string;
  metaDescription: string;
};

export type ShortDocument = Pick<
  Document,
  "source" | "slug" | "title" | "cdtnId"
> & { isPublished: boolean };

export type DocumentRaw = {
  cdtn_id: string;
  initial_id: string;
  source: string;
  document: any;
  slug: string;
  text: string;
  title: string;
  meta_description: string;
};
