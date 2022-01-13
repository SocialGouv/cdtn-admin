import type {
  DilaAlertChanges,
  TravailDataAlertChanges,
  VddAlertChanges,
} from "@shared/types";
import type { ConvenientPatch, Tree } from "nodegit";

import type { GitTagData } from "../types";

export type DataDiffParams = {
  repositoryId: string;
  tag: GitTagData;
  patches: ConvenientPatch[];
  fileFilter: (path: string) => boolean;
  prevTree: Tree;
  currTree: Tree;
};

export type DataDiffFunction = (
  params: DataDiffParams
) => Promise<
  DilaAlertChanges[] | TravailDataAlertChanges[] | VddAlertChanges[]
>;
