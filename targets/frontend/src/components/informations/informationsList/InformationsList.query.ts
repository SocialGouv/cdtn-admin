import { useQuery } from "urql";
import { Information } from "../type";

export const informationsListQuery = `query informationsList($search: String) {
  information_informations(
      where: {
        title: { _ilike: $search }
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

export type QueryInformation = Information;

export type QueryResult = {
  information_informations: QueryInformation[];
};

export type InformationsListQueryProps = {
  search?: string;
};

export type InformationsListQueryResult = {
  rows: QueryInformation[];
};

export const useInformationsListQuery = ({
  search,
}: InformationsListQueryProps): InformationsListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: informationsListQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search,
    },
  });
  return {
    rows: result.data?.information_informations ?? [],
  };
};
