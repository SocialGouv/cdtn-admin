import type {
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";
import type { Commit } from "nodegit";

import type { DilaAlertChanges } from "./diff/dila-data";
import type { TravailDataAlertChanges } from "./diff/fiches-travail-data";
import type { VddAlertChanges } from "./diff/fiches-vdd";

export type Source = {
  repository: string;
  tag: string;
};

export type {
  DilaAddedNode,
  DilaAlertChanges,
  DilaChanges,
  DilaModifiedNode,
  DilaRemovedNode,
} from "./diff/dila-data";
export type {
  FicheTravailEmploiInfo,
  FicheTravailEmploiInfoWithDiff,
  TravailDataAlertChanges,
  TravailDataChanges,
} from "./diff/fiches-travail-data";
export type {
  FicheVddInfo,
  FicheVddInfoWithDiff,
  VddAlertChanges,
  VddChanges,
} from "./diff/fiches-vdd";
export * from "./extractDilaReferences/types";

export type AlertChanges =
  | DilaAlertChanges
  | TravailDataAlertChanges
  | VddAlertChanges;

export type AlertInfo = AlertInfoDila | AlertInfoFiche;

export type AlertInfoFiche = {
  type: "travail-data" | "vdd";
  title: string;
};
export type AlertInfoDila = {
  id: string; // Kalicont
  file: string; //
  type: "dila";
  title: string;
  num?: number;
};

export type HasuraAlert = {
  id: string;
  info: AlertInfo;
  status: string;
  repository: string;
  ref: string;
  changes: AlertChanges;
  created_at: Date;
  updated_at: Date;
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

export type DilaNode =
  | AgreementArticle
  | AgreementSection
  | CodeArticle
  | CodeSection;

export type DilaArticle = AgreementArticle | CodeArticle;
export type DilaSection = AgreementSection | CodeSection;
