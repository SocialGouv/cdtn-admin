export interface Diff {
  missingAgreementsFromDares: Agreement[];
  exceedingAgreementsFromKali: Agreement[];
}

export interface Agreement {
  name: string;
  num: number;
}

export interface DaresAlert {
  id: string;
  info: {
    id: string | number; // idcc number
  };
  status: "doing" | "done" | "rejected" | "todo";
  repository: "dares";
  ref: string;
  changes: {
    type: "dares";
    title: string;
    ref: string;
    date: Date;
    modified: [];
    added: Agreement[];
    removed: Agreement[];
    documents: [];
  };
}

export type DaresAlertInsert = Omit<DaresAlert, "id">;
