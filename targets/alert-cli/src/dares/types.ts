import { DaresAlert } from "@shared/types";

export interface Diff {
  missingAgreementsFromDares: Agreement[];
  exceedingAgreementsFromKali: Agreement[];
}

export interface Agreement {
  name: string;
  num: number;
}

export type DaresAlertInsert = Omit<DaresAlert, "id">;
