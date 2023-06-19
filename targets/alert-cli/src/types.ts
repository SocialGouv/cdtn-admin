import type { AlertChanges } from "@shared/types";

export interface Source {
  repository: string;
  tag: string;
}

export interface RepoAlert {
  repository: string;
  newRef: string;
  changes: AlertChanges[];
}

export interface Commit {
  date: Date;
}

export interface GitTagData {
  ref: string;
  commit: Commit;
}

export interface FicheVddIndex {
  id: string;
  date: string;
  subject: string;
  theme: string;
  title: string;
  type: string;
  breadcrumbs: Theme[];
}

interface Theme {
  id: string;
  text: string;
}

export interface FicheVdd {
  id: string;
  children: FicheVddNode[];
}

export interface FicheVddNode {
  type: string;
  name: string;
  children?: FicheVddNode[];
  text?: string;
}
