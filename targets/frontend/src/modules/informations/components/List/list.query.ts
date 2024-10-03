import { useQuery } from "urql";
import { Information } from "../../type";

export const listQuery = `query informationsList($search: String) {
  information_informations(
      where: {
        title: { _ilike: $search }
      }
      order_by: {updatedAt: desc}
    ) {
        description
        id
        intro
        metaDescription
        metaTitle
        referenceLabel
        sectionDisplayMode
        title
        displayDate
        updatedAt
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
    query: listQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search,
    },
  });
  return {
    rows: result.data?.information_informations ?? [],
  };
};
