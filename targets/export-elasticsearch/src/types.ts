export enum Status {
  running = "running",
  completed = "completed",
  failed = "failed",
}

export enum Environment {
  production = "production",
  preproduction = "preproduction",
}

export interface ExportEsStatus {
  id: string;
  environment: Environment;
  status: Status;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
