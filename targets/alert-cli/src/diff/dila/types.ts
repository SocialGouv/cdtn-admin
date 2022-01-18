import type {
  DilaAddedNode,
  DilaChanges as CommonDilaChanges,
  DilaModifiedNode,
  DilaRemovedNode,
  DocumentReferences,
} from "@shared/types";

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
