import { gql } from "urql";
import { Document, LegiArticle } from "src/components/contributions";
import { News, NewsExternalLink, NewsLink, NewsReference } from "../type";

export const selectNewsQuery = gql`
  query SelectNews($id: uuid!) {
    news: news_news_by_pk(id: $id) {
      id
      title
      metaTitle
      content
      metaDescription
      createdAt
      updatedAt
      displayDate
      imageAlt
      imageAuthor
      imageLicense
      imageWidth
      imageHeight
      imageFile {
        id
        url
        size
      }
      cdtnReferences: news_cdtn_references {
        document {
          cdtnId: cdtn_id
          title
          source
          slug
        }
      }
      newsLinks: news_links(order_by: { order: asc }) {
        kind
        intro
        label
        url
        document {
          cdtnId: cdtn_id
          title
          source
          slug
        }
      }
      newsReferences: news_references(order_by: { order: asc }) {
        kind
        intro
        label
        url
        legiArticle {
          cid
          id
          label
        }
      }
    }
  }
`;

export type NewsRequest = {
  id: string;
};

type NewsRelationRow = {
  intro: string | null;
  label: string | null;
  url: string | null;
};

export type NewsLinkRow = NewsRelationRow & {
  kind: "cdtn" | "external";
  document: Document | null;
};

export type NewsReferenceRow = NewsRelationRow & {
  kind: "legi" | "external";
  legiArticle: LegiArticle | null;
};

export type NewsRow = Omit<News, "links" | "references"> & {
  newsLinks: NewsLinkRow[];
  newsReferences: NewsReferenceRow[];
};

export type NewsResponse = {
  news: NewsRow | null;
};

const toExternalLink = ({
  label,
  url,
  intro,
}: NewsRelationRow): NewsExternalLink => ({
  type: "external",
  label: label ?? "",
  url: url ?? "",
  intro,
});

export const mapNewsRow = ({
  newsLinks,
  newsReferences,
  ...news
}: NewsRow): News => ({
  ...news,
  links: newsLinks.map(
    (link): NewsLink =>
      link.kind === "cdtn" && link.document
        ? { type: "cdtn", document: link.document, intro: link.intro }
        : toExternalLink(link)
  ),
  references: newsReferences.map(
    (reference): NewsReference =>
      reference.kind === "legi" && reference.legiArticle
        ? {
            type: "legi",
            legiArticle: reference.legiArticle,
            intro: reference.intro,
          }
        : toExternalLink(reference)
  ),
});
