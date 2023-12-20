import type {
  DilaAddedNode,
  DilaChanges as CommonDilaChanges,
  DilaModifiedNode,
  DilaRemovedNode,
  DocumentReferences,
} from "@shared/types";
import type {
  AgreementArticle,
  AgreementArticleData,
  AgreementSection,
  AgreementSectionData,
} from "@socialgouv/kali-data-types";
import type { CodeArticle, CodeSection } from "@socialgouv/legi-data-types";

import type { AgreementFileChange } from "./kali/types";
import type { CodeFileChange } from "./legi/types";

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

export type Article<T> = T extends { data: AgreementArticleData }
  ? AgreementArticle
  : CodeArticle;

export type Section<T> = T extends { data: AgreementSectionData }
  ? AgreementSection
  : CodeSection;

export type FileChange<T> = T extends { type: "kali" }
  ? AgreementFileChange
  : CodeFileChange;

export type Parent<T> = T extends CodeSection ? CodeSection : AgreementSection;

export type WithParent<T> = ArticleWithParent<T> | SectionWithParent<T>;

export type ArticleWithParent<T> = Article<T> & {
  parent: WithParent<Parent<T>> | null;
};

export type SectionWithParent<T> = Section<T> & {
  parent: WithParent<Parent<T>> | null;
};
