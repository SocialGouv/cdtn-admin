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
  order: number;
};

export type NewsCdtnReferencesArrRelInsertInput = {
  data: NewsCdtnReferencesInsertInput[];
};

export type NewsLegiReferencesInsertInput = {
  articleId: string;
  order: number;
};

export type NewsLegiReferencesArrRelInsertInput = {
  data: NewsLegiReferencesInsertInput[];
};

export type NewsOtherReferencesInsertInput = {
  label: string;
  url: string;
  order: number;
};

export type NewsOtherReferencesArrRelInsertInput = {
  data: NewsOtherReferencesInsertInput[];
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
  news_legi_references?: NewsLegiReferencesArrRelInsertInput;
  news_other_references?: NewsOtherReferencesArrRelInsertInput;
};

export const formatNewsRelations = ({
  links,
  legiReferences,
}: Pick<FormDataResult, "links" | "legiReferences">): Required<
  Pick<
    NewsInsertInput,
    "news_cdtn_references" | "news_other_references" | "news_legi_references"
  >
> => ({
  news_cdtn_references: {
    data: links.flatMap((link, order) =>
      link.type === "cdtn" ? [{ cdtnId: link.document.cdtnId, order }] : []
    ),
  },
  news_other_references: {
    data: links.flatMap((link, order) =>
      link.type === "external"
        ? [{ label: link.label, url: link.url, order }]
        : []
    ),
  },
  news_legi_references: {
    data: legiReferences.map(({ legiArticle }, order) => ({
      articleId: legiArticle.id,
      order,
    })),
  },
});
