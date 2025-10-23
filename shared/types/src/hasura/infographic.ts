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
  svgFilesize: number;
  description: string;
  meta_description: string;
  transcription: string;
};
