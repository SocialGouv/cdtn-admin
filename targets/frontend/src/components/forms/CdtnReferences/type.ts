export type CdtnReferenceDocument = {
  title: string;
  cdtnId: string;
  source: string;
  slug: string;
};

export type CdtnReference = {
  document: CdtnReferenceDocument;
};
