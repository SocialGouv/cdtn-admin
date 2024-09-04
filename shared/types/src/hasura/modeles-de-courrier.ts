import { HasuraDocument } from "./common";

export type MailTemplate = HasuraDocument<
  MailTemplateDoc,
  "modeles_de_courriers"
>;

export type MailTemplateDoc = {
  meta_title: string;
  date: string;
  type: MailTemplateType;
  html: string;
  author: string;
  filename: string;
  filesize: number;
  intro: string;
  description: string;
  references?: MailTemplateReference[];
};

export type MailTemplateReference = {
  url: string;
  title: string;
  type: "external";
};

export type MailTemplateType = "lettre" | "fichier" | "document";
