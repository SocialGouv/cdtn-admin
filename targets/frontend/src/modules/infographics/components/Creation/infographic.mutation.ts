import { gql, useMutation } from "urql";
import { FormDataResult } from "../Common";
import { InfographicInsertInput } from "../graphql.type";
import { LegiReference } from "../../../../components/forms/LegiReferences/type";
import { OtherReference } from "../../../../components/forms/OtherReferences/type";

const insertInfographicQuery = gql`
  mutation InsertInfographic(
    $infographic: infographic_infographic_insert_input!
  ) {
    insert_infographic_infographic_one(object: $infographic) {
      id
    }
  }
`;

export type MutationProps = FormDataResult;

export type MutationResult = {
  id: string;
};

type MutationGraphQLProps = { infographic: InfographicInsertInput };
type MutationGraphQLResult = {
  insert_infographic_infographic_one: { id: string };
};

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useInfographicInsertMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(insertInfographicQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      infographic: {
        title: data.title,
        metaTitle: data.metaTitle,
        transcription: data.transcription,
        description: data.description,
        metaDescription: data.metaDescription,
        svgFile: {
          data: data.svgFile,
        },
        pdfFile: {
          data: data.pdfFile,
        },
        infographic_legi_references: formatLegiReferences(data.legiReferences),
        infographic_other_references: formatOtherReferences(
          data.otherReferences
        ),
        displayDate: data.displayDate,
      },
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    if (!result.data?.insert_infographic_infographic_one) {
      throw new Error("No data returned from mutation");
    }
    return result.data?.insert_infographic_infographic_one;
  };
  return resultFunction;
};

const formatLegiReferences = (
  refs: LegiReference[]
): InfographicInsertInput["infographic_legi_references"] => {
  return {
    data: refs.map((ref) => ({
      articleId: ref.legiArticle.id,
    })),
  };
};

const formatOtherReferences = (
  refs: OtherReference[]
): InfographicInsertInput["infographic_other_references"] => {
  return {
    data: refs.map((ref) => ({
      label: ref.label,
      url: ref.url,
    })),
  };
};
