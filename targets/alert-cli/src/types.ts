import type {
  AlertChanges,
  DilaAlertChanges,
  TravailDataAlertChanges,
  VddAlertChanges,
} from "@socialgouv/cdtn-types";

export interface PublicAgreement {
  id: string;
  kali_id: string;
}

export interface Diff {
  from: GitTagData;
  to: GitTagData;
  files: DiffFile[];
}

export type PatchStatus = "added" | "modified" | "removed";

export interface DiffFile {
  filename: string;
  status: PatchStatus;
}

export type LoadFileFn = (file: DiffFile, tag: GitTagData) => Promise<string>;

export interface DataDiffParams {
  repositoryId: string;
  tag: GitTagData;
  patches: Diff;
  fileFilter: (path: string) => boolean;
  loadFile: LoadFileFn;
}

export type DataDiffFunction = (
  params: DataDiffParams
) => Promise<
  DilaAlertChanges[] | TravailDataAlertChanges[] | VddAlertChanges[]
>;

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
