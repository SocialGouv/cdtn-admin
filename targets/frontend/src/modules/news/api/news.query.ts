import { gql } from "urql";
import { Document } from "src/components/contributions";
import { News, NewsLink } from "../type";

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
      imageFile {
        id
        url
        size
      }
      cdtnReferences: news_cdtn_references(order_by: { order: asc }) {
        order
        document {
          cdtnId: cdtn_id
          title
          source
          slug
        }
      }
      otherReferences: news_other_references(order_by: { order: asc }) {
        order
        label
        url
      }
      legiReferences: news_legi_references(order_by: { order: asc }) {
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

export type NewsRow = Omit<News, "links"> & {
  cdtnReferences: { order: number; document: Document }[];
  otherReferences: { order: number; label: string; url: string }[];
};

export type NewsResponse = {
  news: NewsRow | null;
};

export const mapNewsRow = ({
  cdtnReferences,
  otherReferences,
  ...news
}: NewsRow): News => {
  const links: { order: number; link: NewsLink }[] = [
    ...cdtnReferences.map(({ order, document }) => ({
      order,
      link: { type: "cdtn" as const, document },
    })),
    ...otherReferences.map(({ order, label, url }) => ({
      order,
      link: { type: "external" as const, label, url },
    })),
  ];
  return {
    ...news,
    links: links.sort((a, b) => a.order - b.order).map(({ link }) => link),
  };
};
