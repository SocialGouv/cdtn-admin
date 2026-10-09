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
      cdtnReferences: data.links.flatMap((link) =>
        link.type === "cdtn" ? [{ cdtnId: link.document.cdtnId }] : []
      ),
      links: data.links.map((link) =>
        link.type === "cdtn"
          ? { type: "cdtn", cdtnId: link.document.cdtnId }
          : { type: "external", title: link.label, url: link.url }
      ),
      references: data.legiReferences.map(({ legiArticle }) => ({
        type: "legi",
        title: `Article ${legiArticle.label} du code du travail`,
        url: `https://www.legifrance.gouv.fr/codes/article_lc/${legiArticle.cid}`,
      })),
      ...(data.imageFile
        ? {
            image: {
              filename: data.imageFile.url,
              sizeOctet: parseInt(data.imageFile.size ?? "0"),
              alt: data.imageAlt ?? "",
              license: data.imageLicense ?? "free",
              ...(data.imageAuthor ? { author: data.imageAuthor } : {}),
            },
          }
        : {}),
    },
  };
};
