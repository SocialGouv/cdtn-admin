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

export type ExportSourcesContent =
  | "conventions_collectives"
  | "code_du_travail"
  | "contributions"
  | "information"
  | "external"
  | "glossary"
  | "highlights"
  | "droit_du_travail"
  | "modeles_de_courriers"
  | "prequalified"
  | "fiches_ministere_travail"
  | "page_fiche_ministere_travail"
  | "fiches_service_public"
  | "dossiers"
  | "themes"
  | "outils"
  | "versions";
