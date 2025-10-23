import { SourceKeys } from "@socialgouv/cdtn-utils";

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

type ExportSourcesContent = SourceKeys;

export interface ExportEsStatus {
  id: string;
  environment: Environment;
  status: Status;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  user?: User;
  error?: string;
  documentsCount?: Record<
    Exclude<ExportSourcesContent, "versions"> | "total",
    number
  >;
}
