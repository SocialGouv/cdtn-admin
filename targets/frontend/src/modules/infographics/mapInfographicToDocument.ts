import { format, parseISO } from "date-fns";
import { generateCdtnId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { HasuraDocument } from "@socialgouv/cdtn-types";
import { Infographic } from "./type";
import { InfographicTemplateDoc } from "@socialgouv/cdtn-types/build/hasura/infographic";

export const mapInfographicToDocument = (
  data: Infographic,
  document?: HasuraDocument<InfographicTemplateDoc>,
): HasuraDocument<InfographicTemplateDoc> => {
  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(data.title),
    initial_id: data.id!,
    source: "infographies",
    meta_description: data.metaDescription,
    title: data.title,
    text: data.description,
    slug: document?.slug ?? slugify(data.title),
    is_searchable: document ? document.is_searchable : true,
    is_published: document ? document.is_published : true,
    is_available: true,
    document: {
      meta_title: data.metaTitle,
      date: format(parseISO(data.displayDate), "dd/MM/yyyy"),
      author: "Ministère du Travail",
      description: data.description,
      meta_description: data.metaDescription,
      svgFilename: data.svgFile.url,
      svgFilesize: parseInt(data.svgFile.size ?? "0"),
      transcription: data.transcription,
    },
  };
};
