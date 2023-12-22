import type { Code } from "@socialgouv/legi-data-types";

export type CodeFileChange = {
  type: "legi";
  current: Code;
  previous: Code;
  file: string;
};
