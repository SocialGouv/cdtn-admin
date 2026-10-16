import { FormDataResult } from "./Common";

export type FilesInsertInput = {
  altText?: string | null;
  id?: string | null;
  size?: string | null;
  url?: string;
};

export enum FilesConstraint {
  FilesPkey = "files_pkey",
}

export enum FilesUpdateColumn {
  AltText = "altText",
  Id = "id",
  Size = "size",
  Url = "url",
}

export type FilesOnConflict = {
  constraint: FilesConstraint;
  update_columns?: FilesUpdateColumn[];
};

export type FilesObjRelInsertInput = {
  data: FilesInsertInput;
  on_conflict?: FilesOnConflict;
};

export type NewsCdtnReferencesInsertInput = {
  cdtnId: string;
};

export type NewsCdtnReferencesArrRelInsertInput = {
  data: NewsCdtnReferencesInsertInput[];
};

export type NewsLinksInsertInput = {
  order: number;
  kind: "cdtn" | "external";
  cdtnId: string | null;
  label: string | null;
  url: string | null;
  intro: string | null;
};

export type NewsLinksArrRelInsertInput = {
  data: NewsLinksInsertInput[];
};

export type NewsReferencesInsertInput = {
  order: number;
  kind: "legi" | "external";
  articleId: string | null;
  label: string | null;
  url: string | null;
  intro: string | null;
};

export type NewsReferencesArrRelInsertInput = {
  data: NewsReferencesInsertInput[];
};

export type NewsInsertInput = {
  createdAt?: string;
  content?: string;
  id?: string;
  metaDescription?: string;
  metaTitle?: string;
  title?: string;
  updatedAt?: string;
  displayDate?: string;
  imageId?: string | null;
  imageAlt?: string | null;
  imageAuthor?: string | null;
  imageLicense?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  imageFile?: FilesObjRelInsertInput;
  news_cdtn_references?: NewsCdtnReferencesArrRelInsertInput;
  news_links?: NewsLinksArrRelInsertInput;
  news_references?: NewsReferencesArrRelInsertInput;
};

const formatIntro = (intro?: string | null) => intro?.trim() || null;

export const formatNewsRelations = ({
  cdtnReferences,
  links,
  references,
}: Pick<FormDataResult, "cdtnReferences" | "links" | "references">): Required<
  Pick<
    NewsInsertInput,
    "news_cdtn_references" | "news_links" | "news_references"
  >
> => ({
  news_cdtn_references: {
    data: cdtnReferences.map(({ document }) => ({ cdtnId: document.cdtnId })),
  },
  news_links: {
    data: links.map((link, order) => ({
      order,
      kind: link.type,
      cdtnId: link.type === "cdtn" ? link.document.cdtnId : null,
      label: link.type === "external" ? link.label : null,
      url: link.type === "external" ? link.url : null,
      intro: formatIntro(link.intro),
    })),
  },
  news_references: {
    data: references.map((reference, order) => ({
      order,
      kind: reference.type,
      articleId: reference.type === "legi" ? reference.legiArticle.id : null,
      label: reference.type === "external" ? reference.label : null,
      url: reference.type === "external" ? reference.url : null,
      intro: formatIntro(reference.intro),
    })),
  },
});
