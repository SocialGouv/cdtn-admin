import { useQuery } from "urql";
import { Information } from "../type";

const informationsQuery = `query informations($id: uuid) {
  information_informations(
      where: {
        id: { _eq: $id }
      }
    ) {
        cdtnId: cdtn_id
        description
        id
        intro
        metaDescription: meta_description
        metaTitle: meta_title
        referenceLabel: reference_label
        sectionDisplayMode: section_display_mode
        title
        updatedAt: updated_at
    }
  }`;

export type QueryInformation = Information & {
  updateDate: Date;
};

export type QueryResult = {
  information_informations: QueryInformation[];
};

export type InformationsQueryProps = {
  id?: string;
};

export type InformationsQueryResult = {
  information: QueryInformation;
};

export const useInformationsQuery = ({
  id,
}: InformationsQueryProps):
  | InformationsQueryResult
  | undefined
  | "not_found"
  | "error" => {
  const [result] = useQuery<QueryResult>({
    query: informationsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id,
    },
  });
  if (result?.error) {
    return "error";
  }
  if (!result?.data) {
    return;
  }
  if (
    !result?.data?.information_informations ||
    result?.data.information_informations?.length == 0
  ) {
    return "not_found";
  }
  return {
    information: result.data?.information_informations[0],
  };
};
