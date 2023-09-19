import {
  Information,
  InformationContent,
  InformationContentBlock,
  InformationContentBlockContent,
  Reference,
  File,
} from "../type";

export type HasuraOnConflict = {
  constraint: string;
  update_columns: string;
};

export type UpsertInformationBlockContent = Omit<
  InformationContentBlockContent,
  "document" | "__typename"
> & {
  cdtnId: string;
};

export type UpsertInformationBlock = Omit<
  InformationContentBlock,
  "contents" | "file" | "__typename"
> & {
  contents: {
    data: UpsertInformationBlockContent[];
    on_conflict: HasuraOnConflict;
  };
  file: {
    data?: File;
    on_conflict: HasuraOnConflict;
  };
};

export type UpsertInformationContent = Omit<
  InformationContent,
  "blocks" | "references" | "__typename"
> & {
  blocks: {
    data: UpsertInformationBlock[];
    on_conflict: HasuraOnConflict;
  };
  references: {
    data: Reference[];
    on_conflict: HasuraOnConflict;
  };
};

export type UpsertInformationObject = Omit<
  Information,
  "contents" | "references" | "__typename"
> & {
  contents: {
    data: UpsertInformationContent[];
    on_conflict: HasuraOnConflict;
  };
  references: {
    data: Reference[];
    on_conflict: HasuraOnConflict;
  };
};
