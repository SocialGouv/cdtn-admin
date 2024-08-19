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

export type ModelModelsLegiReferencesInsertInput = {
  articleId?: string;
};

export type ModelModelsLegiReferencesArrRelInsertInput = {
  data: ModelModelsLegiReferencesInsertInput[];
};

export type Model_Models_Other_References_Insert_Input = {
  id?: string;
  label?: string;
  model?: string;
  modelId?: string;
  url?: string;
};

export type ModelModelsOtherReferencesArrRelInsertInput = {
  data: Model_Models_Other_References_Insert_Input[];
};

export type ModelModelsInsertInput = {
  createdAt?: string;
  intro?: string;
  file?: FilesObjRelInsertInput;
  fileId?: string;
  id?: string;
  metaDescription?: string;
  metaTitle?: string;
  models_legi_references?: ModelModelsLegiReferencesArrRelInsertInput;
  models_other_references?: ModelModelsOtherReferencesArrRelInsertInput;
  previewHTML?: string;
  title?: string;
  type?: string;
  updatedAt?: string;
  displayDate?: string;
};
