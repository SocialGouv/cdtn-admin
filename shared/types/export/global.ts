export type DocumentElasticWithSource<T> = DocumentElastic & T;

export type DocumentRef = {
  breadcrumbs: Breadcrumbs[];
  cdtnId: string;
  description: string;
  slug: string;
  source: string;
  title: string;
  url: string | undefined;
};

export type Breadcrumbs = {
  label: string;
  position: number;
  slug: string;
};

export type DocumentElastic = {
  id: string;
  cdtnId: string;
  breadcrumbs: Breadcrumbs[];
  title: string;
  slug: string;
  source: string;
  text: string;
  isPublished: boolean;
  excludeFromSearch: boolean;
  metaDescription: string;
  refs: DocumentRef[];
};
