import { SOURCES } from "@socialgouv/cdtn-utils";
import { HasuraDocument } from "./common";

export type MailTemplate = HasuraDocument<
  MailTemplateDoc,
  typeof SOURCES.LETTERS
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
