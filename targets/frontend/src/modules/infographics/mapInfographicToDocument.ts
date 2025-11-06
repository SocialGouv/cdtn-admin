import { format, parseISO } from "date-fns";
import { generateCdtnId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { HasuraDocument } from "@socialgouv/cdtn-types";
import { Infographic } from "./type";
import { InfographicTemplateDoc } from "@socialgouv/cdtn-types/build/hasura/infographic";
import { InfographicTemplateReference } from "@socialgouv/cdtn-types/src/hasura/infographic";

export const mapInfographicToDocument = (
  data: Infographic,
  document?: HasuraDocument<InfographicTemplateDoc>
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
      svgFilesizeOctet: parseInt(data.svgFile.size ?? "0"),
      pdfFilename: data.pdfFile.url,
      pdfFilesizeOctet: parseInt(data.pdfFile.size ?? "0"),
      transcription: data.transcription,
      references: [
        ...data.legiReferences.map(
          (ref): InfographicTemplateReference => ({
            type: "legi",
            url: ref.legiArticle.id,
            title: ref.legiArticle.label
          })
        ),
        ...data.otherReferences.map(
          (ref): InfographicTemplateReference => ({
            type: "external",
            url: ref.url,
            title: ref.label
          })
        )
      ]
    }
  };
};
