import { gql, useMutation } from "urql";
import { FormDataResult } from "../Common";
import {
  FilesConstraint,
  FilesUpdateColumn,
  formatNewsRelations,
  NewsInsertInput,
} from "../graphql.type";

const updateNewsQuery = gql`
  mutation UpdateNews($id: uuid = "", $news: news_news_insert_input!) {
    delete_news_news_cdtn_references(where: { newsId: { _eq: $id } }) {
      affected_rows
    }
    delete_news_news_legi_references(where: { newsId: { _eq: $id } }) {
      affected_rows
    }
    delete_news_news_other_references(where: { newsId: { _eq: $id } }) {
      affected_rows
    }
    insert_news_news_one(
      object: $news
      on_conflict: {
        constraint: news_pkey
        update_columns: [
          title
          metaTitle
          content
          metaDescription
          displayDate
          imageId
          imageAlt
          imageAuthor
          imageLicense
        ]
      }
    ) {
      id
    }
  }
`;

export type MutationProps = FormDataResult;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = {
  id: string;
  news: NewsInsertInput;
};

type MutationGraphQLResult = {
  insert_news_news_one: { id: string };
};

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useNewsUpdateMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(updateNewsQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      id: data.id,
      news: {
        id: data.id,
        title: data.title,
        metaTitle: data.metaTitle,
        content: data.content,
        metaDescription: data.metaDescription,
        displayDate: data.displayDate,
        imageAlt: data.imageAlt,
        imageAuthor: data.imageAuthor,
        imageLicense: data.imageLicense,
        ...formatNewsRelations(data),
        ...(data.imageFile
          ? {
              imageFile: {
                data: {
                  id: data.imageFile.id,
                  url: data.imageFile.url,
                  size: data.imageFile.size,
                },
                on_conflict: {
                  constraint: FilesConstraint.FilesPkey,
                  update_columns: [
                    FilesUpdateColumn.Url,
                    FilesUpdateColumn.Size,
                  ],
                },
              },
            }
          : { imageId: null }),
      },
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data?.insert_news_news_one) {
      throw new Error("No data returned from mutation");
    }
    return result.data?.insert_news_news_one;
  };
  return resultFunction;
};
