import type {
  DilaAddedNode,
  DilaChanges as CommonDilaChanges,
  DilaModifiedNode,
  DilaRemovedNode,
  DocumentReferences,
} from "@shared/types";
import type {
  AgreementArticle,
  AgreementSection,
} from "@socialgouv/kali-data-types";
import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";

export type WithParent<
  A extends (AgreementArticle | AgreementSection) | (CodeArticle | CodeSection)
> = A & {
  parent: WithParent<
    A extends CodeArticle | CodeSection ? CodeSection : AgreementSection
  > | null;
};

export type DilaChanges = CommonDilaChanges & {
  file: string;
  id: string;
  title: string;
  num?: number;
};

export type Diff = {
  modified: DilaModifiedNode[];
  added: DilaAddedNode[];
  removed: DilaRemovedNode[];
};

export type RelevantDocumentsFunction = (
  data: Pick<DilaChanges, "modified" | "removed">
) => Promise<DocumentReferences[]>;
