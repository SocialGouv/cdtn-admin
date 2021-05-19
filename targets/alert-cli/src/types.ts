import type { HasuraDocument } from "@shared/types";
import type { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";
import type {
  Agreement as KaliDataAgreement,
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";
import type { Commit } from "nodegit";
import type { NodeWithParent } from "unist-util-parents";

export type fileFilterFn = (path: string) => boolean;

export type compareTreeFn<T> = (tree: T, tree2: T) => Changes;

export type insertAlert = (
  repository: string,
  changes: AlertChanges
) => Promise<Alert>;

export type updateSource = (repository: string, tag: string) => Promise<Source>;

export type Source = {
  repository: string;
  tag: string;
};

export type AstChanges = {
  modified: NodeWithParent<DilaSection, DilaNode>[];
  removed: NodeWithParent<DilaSection, DilaNode>[];
  added: NodeWithParent<DilaSection, DilaNode>[];
};

export type Changes = AstChanges & {
  documents: {
    document: DocumentInfo;
    references: ContributionsData.Reference[];
  }[];
};

export type DilaAlertChanges = Changes & {
  type: "dila";
  ref: string;
  file: string;
  id: string;
  num: number;
  title: string;
  date: Date;
};

export type VddAlertChanges = AstChanges & {
  type: "vdd";
  title: string;
  ref: string;
  date: Date;
};

export type TravailDataAlertChanges = TravailDataChanges & {
  type: "travail-data";
  title: string;
  ref: string;
  date: Date;
};

export type TravailDataChanges = {
  added: FicheTravailEmploiInfo[];
  removed: FicheTravailEmploiInfo[];
  modified: FicheTravailEmploi[];
};

export type AlertChanges =
  | DilaAlertChanges
  | TravailDataAlertChanges
  | VddAlertChanges;

export type AlertInfo = {
  num: number;
  title: string;
  id: string; // Kalicont
  file: string; //
};

export type Alert = {
  info: AlertInfo;
  changes: Changes;
  repository: string;
  source: string;
  status: string;
  ref: string;
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

export type DocumentInfo = Pick<HasuraDocument, "source" | "title"> & {
  id: string;
};

export type DocumentReferences = {
  document: DocumentInfo;
  references: ContributionsData.Reference[];
};

export type DilaNodeWithContext = DilaNode & {
  context: {
    parents: string[];
    textId: string | null;
    containerId: string | null;
  };
};

export type DilaNodeForDiff = DilaNodeWithContext & {
  previous: DilaNodeWithContext;
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

export type FicheTravailEmploiInfo = {
  pubId: string;
  title: string;
  url: string;
};

export type DilaNode =
  | AgreementArticle
  | AgreementSection
  | CodeArticle
  | CodeSection;

export type DilaArticle = AgreementArticle | CodeArticle;
export type DilaSection = AgreementSection | CodeSection;

// Temporarry fix before KaliData type will be updated
export type Agreement = Omit<KaliDataAgreement, "type"> & {
  type: "convention collective";
};
