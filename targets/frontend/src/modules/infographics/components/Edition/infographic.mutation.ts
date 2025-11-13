import { gql, useMutation } from "urql";
import { FormDataResult } from "../Common";
import {
  FilesConstraint,
  FilesUpdateColumn,
  InfographicInsertInput
} from "../graphql.type";
import { LegiReference } from "../../../../components/forms/LegiReferences/type";
import { OtherReference } from "../../../../components/forms/OtherReferences/type";
import { CdtnReference } from "../../../../components/forms/CdtnReferences/type";

const updateInfographicQuery = gql`
  mutation UpdateInfographic(
    $id: uuid = ""
    $infographic: infographic_infographic_insert_input!
  ) {
    delete_infographic_infographic_other_references(
      where: { infographicId: { _eq: $id } }
    ) {
      affected_rows
    }
    delete_infographic_infographic_legi_references(
      where: { infographicId: { _eq: $id } }
    ) {
      affected_rows
    }
    delete_infographic_infographic_cdtn_references(
      where: { infographicId: { _eq: $id } }
    ) {
      affected_rows
    }
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
  id: string;
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
      id: data.id,
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
        infographic_legi_references: {
          data: formatLegiReferences(data.legiReferences)
        },
        infographic_other_references: {
          data: formatOtherReferences(data.otherReferences)
        },
        infographic_cdtn_references: {
          data: formatCdtnReferences(data.cdtnReferences)
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

const formatLegiReferences = (refs: LegiReference[]) => {
  return refs.map((ref) => ({
    articleId: ref.legiArticle.id
  }));
};

const formatOtherReferences = (refs: OtherReference[]) => {
  return refs.map((ref) => ({
    label: ref.label,
    url: ref.url
  }));
};

const formatCdtnReferences = (refs: CdtnReference[]) => {
  return refs.map((ref) => ({
    cdtnId: ref.document.cdtnId
  }));
};
