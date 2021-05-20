import type { HasuraDocument } from "@shared/types";
import type { DilaRef as ContribDilaReference } from "@socialgouv/contributions-data-types";
import type { FicheTravailEmploi } from "@socialgouv/fiches-travail-data-types";
import type {
  Agreement as KaliDataAgreement,
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";
import type { Commit } from "nodegit";

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

export type AstChanges = AstAgreementChanges | AstCodeChanges;

export type AstCodeChanges = {
  modified: DilaNodeForDiff<CodeArticle | CodeSection>[];
  removed: DilaNodeWithContext[];
  added: DilaNodeWithContext[];
};

export type AstAgreementChanges = {
  modified: DilaNodeForDiff<AgreementArticle | AgreementSection>[];
  removed: DilaNodeWithContext[];
  added: DilaNodeWithContext[];
};

export type VddChanges = {
  modified: VddChangeWithDiff[];
  removed: VddChange[];
  added: VddChange[];
};

export type VddChange = {
  id: string;
  type: string;
};

export type VddChangeWithDiff = VddChange & {
  currentText: string;
  id: string;
  previousText: string;
  title: string;
  type: string;
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

export type VddAlertChanges = VddChanges & {
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

export type AlertInfo = AlertInfoDila | AlertInfoFiche;

export type AlertInfoFiche = {
  type: "travail-data" | "vdd";
  title: string;
};
export type AlertInfoDila = {
  type: "dila";
  title: string;
  num: number;
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
  references: DocumentReference[];
};
export type DocumentReference = Pick<
  ContribDilaReference,
  "dila_cid" | "dila_id" | "title" | "url"
>;

export type DilaNodeWithContext = DilaContext & DilaNode;

export type DilaContext = {
  context: {
    parents: string[];
    textId: string | null;
    containerId: string | null;
  };
};

export type DilaNodeForDiff<
  A extends AgreementArticle | AgreementSection | CodeArticle | CodeSection
> = A &
  DilaContext & {
    previous: A;
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
export type AgreementFixed = Omit<KaliDataAgreement, "type"> & {
  type: "convention collective";
};
