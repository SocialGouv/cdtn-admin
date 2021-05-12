import { Node } from "unist";
import { Commit } from "nodegit";
import { NodeWithParent } from "unist-util-parents";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { ParseDilaReference } from "@shared/types";

export function fileFilterFn(path: string): Boolean;

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
  modified: NodeWithParent[];
  removed: NodeWithParent[];
  added: NodeWithParent[];
};

type Changes = AstChanges & {
  documents: { document: DocumentInfo; references: ParseDilaReference[] }[];
};

type DilaAlertChanges = {
  type: "dila";
  ref: string;
  file: string;
  id: string;
  num: Number;
  title: string;
  date: Date;
} & Changes;

type VddAlertChanges = {
  type: "vdd";
  title: string;
  ref: string;
  date: Date;
} & AstChanges;

type TravailDataAlertChanges = {
  type: "travail-data";
  title: string;
  ref: string;
  date: Date;
} & TravailDataChanges;

type TravailDataChanges = {
  added: FicheTravailEmploiInfo[];
  removed: FicheTravailEmploiInfo[];
  modified: FicheTravailEmploi[];
};

type AlertChanges =
  | DilaAlertChanges
  | VddAlertChanges
  | TravailDataAlertChanges;

type AlertInfo = {
  num: Number;
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
type DocumentInfo = Pick<HasuraDocument, "id" | "title" | "source">;
type DocumentReferences = {
  document: DocumentInfo;
  references: ParseDilaReference[];
};

type DilaNode = {
  type: "article" | "section" | "code" | "convention collective";
  parent: DilaNode | null;
  data: {
    id: string;
    cid: string;
    title: string;
    etat: string;
    num: title;
    content?: string;
    nota?: string;
    texte?: string;
  };
  children?: DilaNode[];
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
  | LegiData.CodeArticle
  | LegiData.CodeSection
  | KaliData.AgreementSection
  | KaliData.AgreementArticle;

type DilaArticle = LegiData.CodeArticle | KaliData.AgreementArticle;
type DilaSection = LegiData.CodeSection | KaliData.AgreementSection;

// Temporarry fix before KaliData type will be updated
type Agreement = Omit<KaliData.Agreement, "type"> & {
  type: "convention collective";
};
