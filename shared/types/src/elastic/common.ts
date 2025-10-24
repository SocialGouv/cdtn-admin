import { ContributionsAnswers } from "../hasura";
import { SourceKeys } from "@socialgouv/cdtn-utils";

export type DocumentElasticWithSource<
  T,
  U extends SourceKeys = SourceKeys
> = DocumentElastic<U> & T;

export type Breadcrumb = {
  label: string;
  position: number;
  slug: string;
};

export type DocumentElastic<T extends SourceKeys = SourceKeys> = {
  id: string;
  cdtnId: string;
  breadcrumbs: Breadcrumb[];
  title: string;
  slug: string;
  source: T;
  text: string;
  isPublished: boolean;
  excludeFromSearch: boolean;
  metaDescription: string;
  refs: DocumentRef[];
  contribution?: ContributionsAnswers;
};

export type RelatedDocument<T extends SourceKeys = SourceKeys> = {
  id: string;
  cdtnId: string;
  breadcrumbs: Breadcrumb[];
  title: string;
  slug: string;
  source: T;
  description: string;
  icon?: string; // Pour afficher l'icon du simulateur dans la tuile
  action?: string; // Pour afficher le texte du bouton pour le simulateur dans la tuile
  url?: string; // Pour les outils externes
};

export type DocumentRef<T extends SourceKeys = SourceKeys> = Omit<
  RelatedDocument<T>,
  "action" | "url" | "id"
>;
