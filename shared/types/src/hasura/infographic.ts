import { HasuraDocument } from "./common";
import { SOURCES } from "@socialgouv/cdtn-utils";

export type InfographicTemplate = HasuraDocument<
  InfographicTemplateDoc,
  typeof SOURCES.INFOGRAPHICS
>;

export type InfographicTemplateDoc = {
  meta_title: string;
  date: string;
  author: string;
  svgFilename: string;
  svgFilesizeOctet: number;
  pdfFilename: string;
  pdfFilesizeOctet: number;
  description: string;
  meta_description: string;
  transcription: string;
  references: InfographicTemplateReference[];
  cdtnReferences: InfographicLinkedContent[];
};

export type InfographicLinkedContent = {
  cdtnId: string;
};

export type InfographicTemplateReference = {
  url: string;
  title: string;
  type: "external" | "legi";
};
