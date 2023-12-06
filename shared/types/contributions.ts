export type ContributionsAnswers = {
  id: string;
  content: null | string;
  content_type: ContributionContentType;
  question: {
    id: string;
    content: string;
    order: number;
  };
  kali_references: {
    label: string;
    kali_article: {
      id: string;
      path?: string;
      cid: string;
      label: string;
      agreement_id: string;
    };
  }[];
  legi_references: {
    legi_article: {
      id: string;
      path?: string;
      cid: string;
      label: string;
    };
  }[];
  other_references: {
    label: string;
    url: string;
  }[];
  cdtn_references: {
    document: {
      cdtnId: string;
    };
  }[];
  content_fiche_sp: null | {
    initial_id: string;
    document: Record<string, any>;
  };
  agreement: {
    id: string; // 0000 pour la générique, impossible d'être nulle
    name: string;
    kaliId: string;
  };
};

export type ContributionContentType =
  | "ANSWER"
  | "NOTHING"
  | "CDT"
  | "UNFAVOURABLE"
  | "UNKNOWN"
  | "SP"
  | null;

type ContributionDocumentJsonBasic = {
  references: ContributionRef[];
  contentType: ContributionContentType;
  linkedContent: ContributionLinkedContent[];
  questionIndex: number;
  questionName: string;
  questionId: string;
  idcc: string; // 0000 pour la générique, impossible d'être nulle
};

type ContributionDocumentJsonContent = ContributionDocumentJsonBasic & {
  type: "content";
  content: string;
};

type ContributionDocumentJsonFicheSp = ContributionDocumentJsonBasic & {
  type: "fiche-sp";
  ficheSpId: string;
};

type ContributionDocumentJsonCodeDuTravailReference =
  ContributionDocumentJsonBasic & {
    type: "cdt";
    genericAnswerId: string;
  };

export type ContributionDocumentJson =
  | ContributionDocumentJsonContent
  | ContributionDocumentJsonFicheSp
  | ContributionDocumentJsonCodeDuTravailReference;

export type ContributionLinkedContent = {
  cdtnId: string;
};

export type ContributionRef = {
  url: string;
  title: string;
};

export type ContributionHighlight = {
  title?: string;
  content?: string;
  searchInfo?: string;
};

export type ContributionMessageBlock = {
  id: string;
  label: string;
  contentAgreement: string;
  contentLegal: string;
  contentNotHandled: string;
};
