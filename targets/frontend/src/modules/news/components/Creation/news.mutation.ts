import { gql, useMutation } from "urql";
import { FormDataResult } from "../Common";
import { NewsInsertInput } from "../graphql.type";
import { CdtnReference } from "../../../../components/forms/CdtnReferences/type";

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
        title: data.title,
        metaTitle: data.metaTitle,
        content: data.content,
        metaDescription: data.metaDescription,
        displayDate: data.displayDate,
        news_cdtn_references: {
          data: formatCdtnReferences(data.cdtnReferences),
        },
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

const formatCdtnReferences = (refs: CdtnReference[]) => {
  return refs.map((ref) => ({
    cdtnId: ref.document.cdtnId,
  }));
};
