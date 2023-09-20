import { useMutation } from "urql";

import { Information } from "../type";

import { mapInformation } from "./editInformation.mapping";
import { getElementsToDelete } from "src/lib/mutationUtils";

export const informationMutation = `
mutation edit_information(
  $upsert: information_informations_insert_input!,
  $contentIdsToDelete: [uuid!],
  $referenceIdsToDelete: [uuid!],
  $contentBlockIdsToDelete: [uuid!],
  $contentBlockContentIdsToDelete: [uuid!],
  $contentReferenceIdsToDelete: [uuid!]
) {
  insert_information_informations_one(
    object: $upsert,
    on_conflict: {
      constraint: informations_pkey,
      update_columns: [cdtnId,description,intro, metaTitle, metaDescription,referenceLabel,sectionDisplayMode]
    }
  ) {
    id
  }
  delete_information_informations_references (
    where: {id: {_in: $referenceIdsToDelete}}
  ) {
    affectedRows: affected_rows
  }
  delete_information_informations_contents (
    where: {id: {_in: $contentIdsToDelete}}
  ) {
    affectedRows: affected_rows
  }
  delete_information_informations_contents_references (
    where: {id: {_in: $contentReferenceIdsToDelete}}
  ) {
    affectedRows: affected_rows
  }
  delete_information_informations_contents_blocks (
    where: {id: {_in: $contentBlockIdsToDelete}}
  ) {
    affectedRows: affected_rows
  }
  delete_information_informations_contents_blocks_contents (
    where: {id: {_in: $contentBlockContentIdsToDelete}}
  ) {
    affectedRows: affected_rows
  }
}
`;

export type EditInformationMutationResult = { id?: number };

export type EditInformationMutationExecute = (
  props: Information
) => Promise<EditInformationMutationResult>;

export const useEditInformationMutation =
  (): EditInformationMutationExecute => {
    const [{ data }, executeUpdate] =
      useMutation<EditInformationMutationResult>(informationMutation);
    const resultFunction = async (information: Information) => {
      const upsert = mapInformation(information);
      const contentIdsToDelete = getElementsToDelete(
        defaultInformation,
        information,
        ["contents", "id"]
      );
      const referenceIdsToDelete = getElementsToDelete(
        defaultInformation,
        information,
        ["references", "id"]
      );
      const contentBlockIdsToDelete = getElementsToDelete(
        defaultInformation,
        information,
        ["contents", "blocks", "id"]
      );
      const contentBlockContentIdsToDelete = getElementsToDelete(
        defaultInformation,
        information,
        ["contents", "blocks", "contents", "id"]
      );
      const contentReferenceIdsToDelete = getElementsToDelete(
        defaultInformation,
        information,
        ["contents", "references", "id"]
      );
      const result = await executeUpdate({
        upsert,
        contentIdsToDelete,
        referenceIdsToDelete,
        contentReferenceIdsToDelete,
        contentBlockIdsToDelete,
        contentBlockContentIdsToDelete,
      });
      if (result.error) {
        throw new Error(result.error.message);
      }
      return data ?? {};
    };
    return resultFunction;
  };

let defaultInformation: Information;

export const setDefaultData = (data: Information) => {
  defaultInformation = data;
};
