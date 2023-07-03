import type {
  DilaAlertChanges,
  TravailDataAlertChanges,
  VddAlertChanges,
} from "@shared/types";
import { GitTagData } from "../types";

export interface Diff {
  from: GitTagData;
  to: GitTagData;
  files: DiffFile[];
}

export type PatchStatus = "added" | "modified" | "removed";

export interface DiffFile {
  filename: string;
  status: PatchStatus;
}

export type LoadFileFn = (file: DiffFile, tag: GitTagData) => Promise<string>;

export interface DataDiffParams {
  repositoryId: string;
  tag: GitTagData;
  patches: Diff;
  fileFilter: (path: string) => boolean;
  loadFile: LoadFileFn;
}

export type DataDiffFunction = (
  params: DataDiffParams
) => Promise<
  DilaAlertChanges[] | TravailDataAlertChanges[] | VddAlertChanges[]
>;
