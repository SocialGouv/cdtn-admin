import {
  Information,
  InformationContent,
  InformationContentBlock,
  InformationContentBlockContent,
  Reference,
} from "../../type";
import { File } from "../../../common/type";

export type HasuraOnConflict = {
  constraint: string;
  update_columns: string;
};

export type UpsertInformationBlockContent = Omit<
  InformationContentBlockContent,
  "document"
> & {
  cdtnId: string;
};

export type UpsertInformationBlock = Omit<
  InformationContentBlock,
  "contents" | "file"
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
  "blocks" | "references"
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
  "contents" | "references"
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
