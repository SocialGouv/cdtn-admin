import { DaresAlert } from "@socialgouv/cdtn-types";

export interface Diff {
  addedAgreementsFromDares: Agreement[];
  removedAgreementsFromDares: Agreement[];
}

export interface Agreement {
  name: string;
  num: number;
}

export type DaresAlertInsert = Omit<DaresAlert, "id">;
