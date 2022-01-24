import type { Agreement } from "@socialgouv/kali-data-types";

export type AgreementFileChange = {
  type: "kali";
  current: Agreement | null;
  previous: Agreement | null;
  file: string;
};
