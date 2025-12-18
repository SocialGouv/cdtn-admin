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

export type InfographicLegiReferencesInsertInput = {
  articleId?: string;
};

export type InfographicLegiReferencesArrRelInsertInput = {
  data: InfographicLegiReferencesInsertInput[];
};

export type Infographic_Other_References_Insert_Input = {
  id?: string;
  label?: string;
  model?: string;
  modelId?: string;
  url?: string;
};

export type InfographicOtherReferencesArrRelInsertInput = {
  data: Infographic_Other_References_Insert_Input[];
};

export type InfographicCdtnReferencesInsertInput = {
  cdtnId: string;
};

export type InfographicCdtnReferencesArrRelInsertInput = {
  data: InfographicCdtnReferencesInsertInput[];
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
  infographic_legi_references?: InfographicLegiReferencesArrRelInsertInput;
  infographic_other_references?: InfographicOtherReferencesArrRelInsertInput;
  infographic_cdtn_references?: InfographicCdtnReferencesArrRelInsertInput;
};
