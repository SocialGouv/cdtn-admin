import { HasuraDocument } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type NewsTemplate = HasuraDocument<NewsTemplateDoc, typeof SOURCES.NEWS>;

export type NewsTemplateDoc = {
  meta_title: string;
  date: string; // dd/MM/yyyy, jour de la dernière publication (date affichée)
  updatedAt?: string; // ISO 8601, instant de la dernière publication
  publishedAt?: string; // ISO 8601, instant de la première publication
  author: string;
  content: string;
  meta_description: string;
  // Ancien bloc « Contenus liés », fusionné dans `links` : présent seulement
  // sur les actualités publiées avant la fusion.
  cdtnReferences?: NewsLinkedContent[];
  links?: NewsTemplateLink[];
  references?: NewsTemplateReference[];
  image?: NewsTemplateImage;
};

export type NewsLinkedContent = {
  cdtnId: string;
};

export type NewsTemplateExternalLink = {
  type: "external";
  title: string;
  url: string;
  intro?: string;
};

export type NewsTemplateLink =
  | { type: "cdtn"; cdtnId: string; intro?: string }
  | NewsTemplateExternalLink;

export type NewsTemplateReference =
  | { type: "legi"; title: string; url: string; intro?: string }
  | NewsTemplateExternalLink;

export type NewsImageLicense = "free" | "source";

export type NewsTemplateImage = {
  filename: string;
  sizeOctet: number;
  alt: string;
  author?: string;
  license: NewsImageLicense;
  width?: number;
  height?: number;
};
