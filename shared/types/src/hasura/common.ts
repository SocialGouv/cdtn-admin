import { SourceKeys } from "@socialgouv/cdtn-utils";

export type HasuraDocument<T, U extends SourceKeys = SourceKeys> = Pick<
  HasuraDocumentBase,
  | "cdtn_id"
  | "initial_id"
  | "slug"
  | "text"
  | "title"
  | "meta_description"
  | "is_available"
  | "is_published"
  | "is_searchable"
> & {
  source: U;
  document: T;
};

export type ShortHasuraDocument<T> = Pick<
  HasuraDocument<T>,
  "source" | "slug" | "title" | "initial_id" | "cdtn_id"
> & { isPublished: boolean };

export type HasuraDocumentBase = {
  cdtn_id: string;
  initial_id: string;
  slug: string;
  text: string;
  title: string;
  meta_description: string;
  is_available: boolean;
  is_searchable: boolean;
  is_published: boolean;
};
