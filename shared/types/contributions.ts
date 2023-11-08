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

export type ContributionDocumentJsonBasic = {
  references: ContributionRef[];
  contentType: ContributionContentType;
  linkedContent: ContributionLinkedContent[];
  content: string;
};

export type ContributionDocumentJsonFicheSpContent = Omit<
  ContributionDocumentJsonBasic,
  "content"
> & {
  raw: Record<string, any>;
  url: string;
  date: string;
};

export type ContributionDocumentJson =
  | ContributionDocumentJsonFicheSpContent
  | ContributionDocumentJsonBasic;

export type ContributionLinkedContent = {
  slug: string;
  source: string;
  title: string;
};

export type ContributionRef = {
  url: string;
  title: string;
};
