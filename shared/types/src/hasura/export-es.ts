export enum Status {
  running = "running",
  completed = "completed",
  failed = "failed",
  timeout = "timeout",
}

export enum Environment {
  production = "production",
  preproduction = "preproduction",
}

interface User {
  id: string;
  name: string;
  email: string;
}

type ExportSourcesContent =
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

export interface ExportEsStatus {
  id: string;
  environment: Environment;
  status: Status;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  finished_at?: Date;
  user?: User;
  error?: string;
  documentsCount?: Record<
    Exclude<ExportSourcesContent, "versions"> | "total",
    number
  >;
}
