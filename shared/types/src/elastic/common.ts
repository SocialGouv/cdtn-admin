export type DocumentElasticWithSource<T> = DocumentElastic & T;

export type DocumentRef = {
  breadcrumbs: Breadcrumb[];
  cdtnId: string;
  description: string;
  slug: string;
  source: string;
  title: string;
  url: string | undefined;
};

export type Breadcrumb = {
  label: string;
  position: number;
  slug: string;
};

export type DocumentElastic = {
  id: string;
  cdtnId: string;
  breadcrumbs: Breadcrumb[];
  title: string;
  slug: string;
  source: string;
  text: string;
  isPublished: boolean;
  excludeFromSearch: boolean;
  metaDescription: string;
  refs: DocumentRef[];
};

export type RelatedDocument = {
  id: string;
  cdtnId: string;
  breadcrumbs: Breadcrumb[];
  title: string;
  slug: string;
  source: string;
  description: string;
  icon?: string; // Pour afficher l'icon du simulateur dans la tuile
  action?: string; // Pour afficher le texte du bouton pour le simulateur dans la tuile
};
