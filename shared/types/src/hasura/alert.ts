import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";
import type {
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import { HasuraDocument } from "./common";

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

export type AlertInfo = { id: string };

export type AlertChanges =
  | DilaAlertChanges
  | TravailDataAlertChanges
  | VddAlertChanges
  | DaresAlertChanges;

/** Dila alert changes */
export type DilaAlertChanges = DilaChanges & {
  type: "dila";
  ref: string;
  title: string;
  date: Date;
  id: string;
  file: string;
  num?: number;
};

export type DilaChanges = {
  modified: DilaModifiedNode[];
  added: DilaAddedNode[];
  removed: DilaRemovedNode[];
  documents: DocumentReferences[];
};

export type DilaAddedNode = {
  etat: string;
  parents: string[];
  title: string;
  id: string;
  cid: string;
};

export type DilaRemovedNode = {
  parents: string[];
  title: string;
  id: string;
  cid: string;
};

export type DilaModifiedNode = {
  parents: string[];
  title: string;
  id: string;
  cid: string;
  etat: string;
  diffs: DiffInfo[];
};

export type DilaNode =
  | AgreementArticle
  | AgreementSection
  | CodeArticle
  | CodeSection;

export type DilaArticle = AgreementArticle | CodeArticle;
export type DilaSection = AgreementSection | CodeSection;

export type DiffInfo = {
  type: "etat" | "nota" | "texte";
  currentText: string;
  previousText: string;
};

export type DocumentReferences = {
  document: DocumentInfo;
  references: DocumentReference[];
};

export type DocumentReference = Pick<
  DilaRef,
  "dila_cid" | "dila_container_id" | "dila_id" | "title" | "url"
>;

export type DocumentInfo = Pick<
  HasuraDocument<any>,
  "source" | "title" | "slug"
> & {
  id: string;
};

export type DocumentInfoWithCdtnRef = DocumentInfo & {
  ref: Pick<DocumentInfo, "id" | "title">;
  url?: string;
};

/** Fiche travail alert changes */
export type TravailDataAlertChanges = TravailDataChanges & {
  type: "travail-data";
  title: string;
  ref: string;
  date: Date;
};

export type TravailDataChanges = {
  added: FicheTravailEmploiInfo[];
  removed: FicheTravailEmploiInfo[];
  modified: FicheTravailEmploiInfoWithDiff[];
  documents: DocumentInfoWithCdtnRef[];
};

export type FicheTravailEmploiInfo = {
  pubId: string;
  title: string;
  url: string;
};

export type FicheTravailEmploiInfoWithDiff = FicheTravailEmploiInfo & {
  removedSections: SectionTextChange[];
  addedSections: SectionTextChange[];
  modifiedSections: SectionTextChange[];
};

export type SectionTextChange = {
  title: string;
  currentText: string;
  previousText: string;
};

/** fiche vdd  alert changes*/
export type VddAlertChanges = VddChanges & {
  type: "vdd";
  title: string;
  ref: string;
  date: Date;
};

export type DaresAlertChanges = {
  type: "dares";
  title: string;
  ref: string;
  date: Date;
  modified: [];
  added: {
    name: string;
    num: number;
  }[];
  removed: {
    name: string;
    num: number;
  }[];
  documents: [];
};

export type DaresAlert = {
  id: string;
  info: {
    id: string | number; // idcc number
  };
  status: "doing" | "done" | "rejected" | "todo";
  repository: "dares";
  ref: string;
  changes: DaresAlertChanges;
};

export type VddChanges = {
  modified: FicheVddInfoWithDiff[];
  removed: FicheVddInfo[];
  added: FicheVddInfo[];
  documents: DocumentInfoWithCdtnRef[];
};

export type FicheVddInfo = {
  id: string;
  type: string;
  title: string;
};

export type FicheVddInfoWithDiff = FicheVddInfo & {
  currentText: string;
  previousText: string;
};

export type ContributionReference = BaseRef | DilaRef;

export type DilaRef = {
  category: "agreement" | "labor_code";
  url: string;
  title: string;
  dila_id: string;
  dila_cid: string;
  dila_container_id: string;
};

export type BaseRef = {
  category: null;
  title: string;
  url: string | null;
};

export type State =
  | "ABROGE"
  | "DENONCE"
  | "MODIFIE"
  | "PERIME"
  | "REMPLACE"
  | "VIGUEUR"
  | "VIGUEUR_ETEN"
  | "VIGUEUR_NON_ETEN";
