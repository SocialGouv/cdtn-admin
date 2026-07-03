import { DaresAlert } from "@socialgouv/cdtn-types";

export interface Diff {
  addedAgreementsFromDares: Agreement[];
  removedAgreementsFromDares: Agreement[];
}

export interface Agreement {
  name: string;
  num: number;
  // Code successeur d'après la DARES (NouvIDCC / NouvCODE), quand la convention
  // a été fusionnée/remplacée. Affiché dans le message de l'alerte.
  newNum?: number;
}

export type DaresAlertInsert = Omit<DaresAlert, "id">;
