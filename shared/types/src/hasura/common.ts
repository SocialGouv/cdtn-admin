import { SourceKeys } from "@socialgouv/cdtn-utils";

export type HasuraDocument<T, U extends SourceKeys = SourceKeys> = {
  cdtn_id: string;
  initial_id: string;
  source: U;
  document: T;
  slug: string;
  text: string;
  title: string;
  meta_description: string;
  is_available: boolean;
  is_searchable: boolean;
  is_published: boolean;
};

export type ShortHasuraDocument<T> = Pick<
  HasuraDocument<T>,
  "source" | "slug" | "title" | "initial_id" | "cdtn_id"
> & { isPublished: boolean };
