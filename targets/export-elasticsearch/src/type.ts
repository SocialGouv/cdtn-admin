import { ValidatorChatType } from "./controllers/middlewares";

export enum CollectionSlug {
  SERVICE_PUBLIC = "service-public",
  CONTRIBUTION_IDCC = "contribution-idcc",
  CONTRIBUTION_GENERIC = "contribution-generic",
}

export interface DocumentRepo {
  id: string;
  cdtnId: string;
  title: string;
  slug: string;
  source: string;
  text: string;
  isPublished: boolean;
  isSearchable: boolean;
  metaDescription: string;
  document: {
    raw: string;
    url: string;
    date: string;
    description: string;
    answers?: {
      generic?: {
        markdown: string;
        text: string;
      };
      conventionAnswer?: {
        markdown: string;
      };
    };
    referencedTexts?:
      | {
          slug: string;
          type: string;
          title: string;
        }[]
      | null;
  };
  __typename: string;
}
