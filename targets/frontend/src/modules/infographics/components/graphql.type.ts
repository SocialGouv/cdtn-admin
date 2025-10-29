export type FilesInsertInput = {
  altText?: string | null;
  id?: string | null;
  size?: string | null;
  url?: string;
};

export enum FilesConstraint {
  FilesPkey = "files_pkey"
}

export enum FilesUpdateColumn {
  AltText = "altText",
  Id = "id",
  Size = "size",
  Url = "url"
}

export type FilesOnConflict = {
  constraint: FilesConstraint;
  update_columns?: FilesUpdateColumn[];
};

export type FilesObjRelInsertInput = {
  data: FilesInsertInput;
  on_conflict?: FilesOnConflict;
};

export type InfographicInsertInput = {
  createdAt?: string;
  description?: string;
  svgFile?: FilesObjRelInsertInput;
  pdfFile?: FilesObjRelInsertInput;
  svgFileId?: string;
  fileId?: string;
  id?: string;
  metaDescription?: string;
  transcription?: string;
  metaTitle?: string;
  title?: string;
  updatedAt?: string;
  displayDate?: string;
};
