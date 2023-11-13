import { SourceRoute } from "@socialgouv/cdtn-sources";

export type Document<T> = {
  cdtn_id: string;
  initial_id: string;
  source: SourceRoute;
  document: T;
  slug: string;
  text: string;
  title: string;
  meta_description: string;
  is_available: boolean;
};

export type ShortDocument<T> = Pick<
  Document<T>,
  "source" | "slug" | "title" | "initial_id" | "cdtn_id"
> & { isPublished: boolean };
