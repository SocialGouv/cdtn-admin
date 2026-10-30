import { CombinedError, gql, useMutation } from "urql";
import { FormDataResult } from "../Common";
import { formatNewsRelations, NewsInsertInput } from "../graphql.type";

// L'id est généré une seule fois à l'ouverture du formulaire de création : un
// second insert avec le même id veut dire que l'actualité existe déjà.
export const isNewsAlreadyCreated = (error?: CombinedError): boolean =>
  !!error?.graphQLErrors.some(
    (e) =>
      e.extensions?.code === "constraint-violation" &&
      /"news_(pkey|id_key)"/.test(e.message)
  );

const insertNewsQuery = gql`
  mutation InsertNews($news: news_news_insert_input!) {
    insert_news_news_one(object: $news) {
      id
    }
  }
`;

export type MutationProps = FormDataResult;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = { news: NewsInsertInput };
type MutationGraphQLResult = {
  insert_news_news_one: { id: string };
};

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useNewsInsertMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(insertNewsQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
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
        imageWidth: data.imageWidth,
        imageHeight: data.imageHeight,
        ...formatNewsRelations(data),
        ...(data.imageFile
          ? {
              imageFile: {
                data: { url: data.imageFile.url, size: data.imageFile.size },
              },
            }
          : {}),
      },
    });
    if (isNewsAlreadyCreated(result.error)) {
      return { id: data.id };
    }
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
