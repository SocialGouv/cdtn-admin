export type ContributionsAnswers = {
  id: string;
  content: null | string;
  content_type: ContributionContentType;
  question: {
    id: string;
    content: string;
    order: number;
    message: {
      content: string;
    } | null;
  };
  kali_references: {
    label: string;
    kali_article: {
      id: string;
      path?: string;
      cid: string;
      label: string;
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
    title: string;
    source: string;
    slug: string;
  }[];
  content_fiche_sp: null | {
    document: Record<string, any>;
  };
  agreement: {
    id: string;
    name: string;
  } | null;
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
};

type ContributionDocumentJsonContent = ContributionDocumentJsonBasic & {
  type: "content";
  content: string;
};

type ContributionDocumentJsonFicheSp = ContributionDocumentJsonBasic & {
  type: "fiche-sp";
  ficheSpId: string;
};

export type ContributionDocumentJson =
  | ContributionDocumentJsonContent
  | ContributionDocumentJsonFicheSp;

export type ContributionLinkedContent = {
  slug: string;
  source: string;
  title: string;
};

export type ContributionRef = {
  url: string;
  title: string;
};
