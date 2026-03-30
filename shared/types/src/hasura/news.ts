import { HasuraDocument } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type NewsTemplate = HasuraDocument<NewsTemplateDoc, typeof SOURCES.NEWS>;

export type NewsTemplateDoc = {
  meta_title: string;
  date: string;
  author: string;
  content: string;
  meta_description: string;
  cdtnReferences: NewsLinkedContent[];
};

export type NewsLinkedContent = {
  cdtnId: string;
};
