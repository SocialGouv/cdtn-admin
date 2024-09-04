import { format, parseISO } from "date-fns";
import { generateCdtnId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { Model } from "../models";
import {
  HasuraDocument,
  MailTemplateDoc,
  MailTemplateReference,
} from "@socialgouv/cdtn-types";

export const mapModelToDocument = (
  data: Model,
  document?: HasuraDocument<MailTemplateDoc>
): HasuraDocument<MailTemplateDoc> => {
  return {
    cdtn_id: document?.cdtn_id ?? generateCdtnId(data.title),
    initial_id: data.id!,
    source: "modeles_de_courriers",
    meta_description: data.metaDescription,
    title: data.title,
    text: data.intro,
    slug: document?.slug ?? slugify(data.title),
    is_searchable: document ? document.is_searchable : true,
    is_published: document ? document.is_published : true,
    is_available: true,
    document: {
      meta_title: data.metaTitle,
      type: data.type,
      date: format(parseISO(data.displayDate), "dd/MM/yyyy"),
      author: "Ministère du Travail",
      references: data.legiReferences
        .map(
          (item): MailTemplateReference => ({
            url: `https://www.legifrance.gouv.fr/codes/article_lc/${item.legiArticle.cid}`,
            title: item.legiArticle.label,
            type: "external",
          })
        )
        .concat(
          data.otherReferences.map((item) => ({
            url: item.url ?? "",
            title: item.label,
            type: "external",
          }))
        ),
      description: data.metaDescription,
      intro: data.intro,
      filename: data.file.url,
      filesize: parseInt(data.file.size ?? "0"),
      html: data.previewHTML,
    },
  };
};
