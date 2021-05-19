import { Commit } from "nodegit";
import { NodeWithParent } from "unist-util-parents";
import { HasuraDocument } from "@shared/types";
import { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";
import "@socialgouv/kali-data-types";

export function fileFilterFn(path: string): boolean;

export function compareTreeFn<T>(tree: T, tree2: T): Changes;

export function insertAlert(
  repository: string,
  changes: AlertChanges
): Promise<alerts.Alert>;

export function updateSource(
  repository: string,
  tag: string
): Promise<alerts.Source>;

export as namespace alerts;

type Source = {
  repository: string;
  tag: string;
};

type AstChanges = {
  modified: NodeWithParent<DilaSection, DilaNode>[];
  removed: NodeWithParent<DilaSection, DilaNode>[];
  added: NodeWithParent<DilaSection, DilaNode>[];
};

type Changes = AstChanges & {
  documents: {
    document: DocumentInfo;
    references: ContributionsData.Reference[];
  }[];
};

type DilaAlertChanges = Changes & {
  type: "dila";
  ref: string;
  file: string;
  id: string;
  num: number;
  title: string;
  date: Date;
};

type VddAlertChanges = AstChanges & {
  type: "vdd";
  title: string;
  ref: string;
  date: Date;
};

type TravailDataAlertChanges = TravailDataChanges & {
  type: "travail-data";
  title: string;
  ref: string;
  date: Date;
};

type TravailDataChanges = {
  added: FicheTravailEmploiInfo[];
  removed: FicheTravailEmploiInfo[];
  modified: FicheTravailEmploi[];
};

type AlertChanges =
  | DilaAlertChanges
  | TravailDataAlertChanges
  | VddAlertChanges;

type AlertInfo = {
  num: number;
  title: string;
  id: string; // Kalicont
  file: string; //
};

type Alert = {
  info: AlertInfo;
  changes: Changes;
  repository: string;
  source: string;
  status: string;
  ref: string;
};

type RepoAlert = {
  repository: string;
  newRef: string;
  changes: AlertChanges[];
};

type GitTagData = {
  ref: string;
  commit: Commit;
};

type DocumentInfo = Pick<HasuraDocument, "source" | "title"> & {
  id: string;
};

type DocumentReferences = {
  document: DocumentInfo;
  references: ContributionsData.Reference[];
};

type DilaNodeWithContext = DilaNode & {
  context: {
    parents: string[];
    textId: string | null;
    containerId: string | null;
  };
};

type DilaNodeForDiff = DilaNodeWithContext & {
  previous: DilaNodeWithContext;
};

type FicheVddIndex = {
  id: string;
  date: string;
  subject: string;
  theme: string;
  title: string;
  type: string;
};

type FicheVdd = {
  id: string;
  children: FicheVddNode[];
};

type FicheVddNode = {
  type: string;
  name: string;
  children?: FicheVddNode[];
  text?: string;
};

export type FicheTravailEmploiInfo = {
  pubId: string;
  title: string;
  url: string;
};

type DilaNode =
  | KaliData.AgreementArticle
  | KaliData.AgreementSection
  | LegiData.CodeArticle
  | LegiData.CodeSection;

type DilaArticle = KaliData.AgreementArticle | LegiData.CodeArticle;
type DilaSection = KaliData.AgreementSection | LegiData.CodeSection;

// Temporarry fix before KaliData type will be updated
type Agreement = Omit<KaliData.Agreement, "type"> & {
  type: "convention collective";
};
