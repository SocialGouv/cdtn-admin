export interface ContributionsAnswers {
  id: string;
  content: null | string;
  content_type:
    | "ANSWER"
    | "NOTHING"
    | "CDT"
    | "UNFAVOURABLE"
    | "UNKNOWN"
    | "SP"
    | null;
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
}
