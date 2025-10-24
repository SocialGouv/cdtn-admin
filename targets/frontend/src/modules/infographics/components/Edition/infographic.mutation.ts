import { gql, useMutation } from "urql";
import { FormDataResult } from "../Common";
import {
  FilesConstraint,
  FilesUpdateColumn,
  InfographicInsertInput
} from "../graphql.type";

const updateInfographicQuery = gql`
  mutation UpdateInfographic(
    $infographic: infographic_infographic_insert_input!
  ) {
    insert_infographic_infographic_one(
      object: $infographic
      on_conflict: {
        constraint: infographic_pkey
        update_columns: [
          title
          metaTitle
          description
          metaDescription
          transcription
          displayDate
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
  infographic: InfographicInsertInput;
};

type MutationGraphQLResult = {
  insert_infographic_infographic_one: { id: string };
};

export type MutationFn = (props: MutationProps) => Promise<MutationResult>;

export const useModelUpdateMutation = (): MutationFn => {
  const [, executeUpdate] = useMutation<
    MutationGraphQLResult,
    MutationGraphQLProps
  >(updateInfographicQuery);
  const resultFunction = async (data: MutationProps) => {
    const result = await executeUpdate({
      infographic: {
        id: data.id,
        title: data.title,
        metaTitle: data.metaTitle,
        description: data.description,
        metaDescription: data.metaDescription,
        transcription: data.transcription,
        svgFile: {
          data: {
            url: data.svgFile.url,
            size: data.svgFile.size,
            altText: data.svgFile.altText,
            id: data.svgFile.id
          },
          on_conflict: {
            constraint: FilesConstraint.FilesPkey,
            update_columns: [
              FilesUpdateColumn.Url,
              FilesUpdateColumn.Size,
              FilesUpdateColumn.AltText
            ]
          }
        },
        pdfFile: {
          data: {
            url: data.pdfFile.url,
            size: data.pdfFile.size,
            altText: data.pdfFile.altText,
            id: data.pdfFile.id
          },
          on_conflict: {
            constraint: FilesConstraint.FilesPkey,
            update_columns: [
              FilesUpdateColumn.Url,
              FilesUpdateColumn.Size,
              FilesUpdateColumn.AltText
            ]
          }
        },
        displayDate: data.displayDate
      }
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
