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
  links?: NewsTemplateLink[];
  references?: NewsTemplateReference[];
  image?: NewsTemplateImage;
};

export type NewsLinkedContent = {
  cdtnId: string;
};

export type NewsTemplateLink =
  | { type: "cdtn"; cdtnId: string }
  | { type: "external"; title: string; url: string };

export type NewsTemplateReference = {
  type: "legi";
  title: string;
  url: string;
};

export type NewsImageLicense = "free" | "source";

export type NewsTemplateImage = {
  filename: string;
  sizeOctet: number;
  alt: string;
  author?: string;
  license: NewsImageLicense;
};
