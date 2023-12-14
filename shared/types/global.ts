export type BaseHasuraDocument = {
  cdtn_id: string;
  initial_id: string;
  is_available: boolean;
  is_searchable: boolean;
  is_published: boolean;
  meta_description: string;
  slug: string;
  title: string;
  text: string;
  created_at: Date;
  updated_at: Date;
};
