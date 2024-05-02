import { HasuraDocument } from "./common";

export type MailTemplate = HasuraDocument<
  MailTemplateDoc,
  "modeles_de_courriers"
>;

export type MailTemplateDoc = {
  date: string;
  html: string;
  author: string;
  filename: string;
  filesize: number;
  description: string;
  references?: {
    url: string;
    title: string;
    type: string;
  }[];
};
