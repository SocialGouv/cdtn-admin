import { format, parseISO } from "date-fns";
import { generateCdtnId } from "@shared/utils";
import slugify from "@socialgouv/cdtn-slugify";
import { HasuraDocument } from "@socialgouv/cdtn-types";
import { News, NewsExternalLink } from "./type";
import {
  NewsTemplateDoc,
  NewsTemplateExternalLink,
  NewsTemplateLink,
  NewsTemplateReference,
} from "@socialgouv/cdtn-types/";

const intro = ({ intro }: { intro?: string | null }) =>
  intro?.trim() ? { intro: intro.trim() } : {};

const externalLink = (link: NewsExternalLink): NewsTemplateExternalLink => ({
  type: "external",
  title: link.label,
  url: link.url,
  ...intro(link),
});

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
      ...(data.updatedAt ? { updatedAt: data.updatedAt } : {}),
      author: "Ministère du Travail",
      content: data.content,
      meta_description: data.metaDescription,
      cdtnReferences: data.cdtnReferences.map(({ document }) => ({
        cdtnId: document.cdtnId,
      })),
      links: data.links.map(
        (link): NewsTemplateLink =>
          link.type === "cdtn"
            ? { type: "cdtn", cdtnId: link.document.cdtnId, ...intro(link) }
            : externalLink(link)
      ),
      references: data.references.map(
        (reference): NewsTemplateReference =>
          reference.type === "legi"
            ? {
                type: "legi",
                title: `Article ${reference.legiArticle.label} du code du travail`,
                url: `https://www.legifrance.gouv.fr/codes/article_lc/${reference.legiArticle.cid}`,
                ...intro(reference),
              }
            : externalLink(reference)
      ),
      ...(data.imageFile
        ? {
            image: {
              filename: data.imageFile.url,
              sizeOctet: parseInt(data.imageFile.size ?? "0"),
              alt: data.imageAlt ?? "",
              license: data.imageLicense ?? "free",
              ...(data.imageWidth && data.imageHeight
                ? { width: data.imageWidth, height: data.imageHeight }
                : {}),
              ...(data.imageAuthor ? { author: data.imageAuthor } : {}),
            },
          }
        : {}),
    },
  };
};
