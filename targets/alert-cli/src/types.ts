import type { AlertChanges } from "@shared/types";
import type { Commit } from "nodegit";

export type Source = {
  repository: string;
  tag: string;
};

export type RepoAlert = {
  repository: string;
  newRef: string;
  changes: AlertChanges[];
};

export type GitTagData = {
  ref: string;
  commit: Commit;
};

export type FicheVddIndex = {
  id: string;
  date: string;
  subject: string;
  theme: string;
  title: string;
  type: string;
  breadcrumbs: Theme[];
};

type Theme = {
  id: string;
  text: string;
};

export type FicheVdd = {
  id: string;
  children: FicheVddNode[];
};

export type FicheVddNode = {
  type: string;
  name: string;
  children?: FicheVddNode[];
  text?: string;
};
