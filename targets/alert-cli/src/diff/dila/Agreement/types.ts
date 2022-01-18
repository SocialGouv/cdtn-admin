import type { Agreement } from "@socialgouv/kali-data-types";

export type AgreementFileChange = {
  type: "kali";
  current: Agreement;
  previous: Agreement;
  file: string;
};
