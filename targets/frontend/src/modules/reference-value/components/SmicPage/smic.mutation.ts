import { gql, useMutation } from "urql";
import { SmicValue } from "../../type";

const insertSmicValueMutation = gql`
  mutation InsertSmicValue(
    $hourlyValue: numeric!
    $applicationDate: date!
    $note: String
    $createdBy: String
  ) {
    insert_reference_value_smic_values_one(
      object: {
        hourlyValue: $hourlyValue
        applicationDate: $applicationDate
        note: $note
        createdBy: $createdBy
      }
    ) {
      id
      hourlyValue
      applicationDate
      createdAt
      createdBy
    }
  }
`;

type MutationResult = {
  insert_reference_value_smic_values_one: SmicValue;
};

export function useInsertSmicValueMutation() {
  return useMutation<MutationResult>(insertSmicValueMutation);
}
