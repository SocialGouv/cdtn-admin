import { format, parseISO } from "date-fns";
import { generateCdtnId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { HasuraDocument } from "@socialgouv/cdtn-types";
import { News } from "./type";
import { NewsTemplateDoc } from "@socialgouv/cdtn-types/";

export const mapNewsToDocument = (
  data: News,
  document?: HasuraDocument<NewsTemplateDoc>
): HasuraDocument<NewsTemplateDoc> => {
  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(data.title),
    initial_id: data.id!,
    source: "actualites",
    meta_description: data.metaDescription,
    title: data.title,
    text: data.content,
    slug: document?.slug ?? slugify(data.title),
    is_searchable: document ? document.is_searchable : true,
    is_published: document ? document.is_published : true,
    is_available: true,
    document: {
      meta_title: data.metaTitle,
      date: format(parseISO(data.displayDate), "dd/MM/yyyy"),
      author: "Ministère du Travail",
      content: data.content,
      meta_description: data.metaDescription,
      cdtnReferences: data.cdtnReferences.map((ref) => ({
        cdtnId: ref.document.cdtnId,
      })),
    },
  };
};
