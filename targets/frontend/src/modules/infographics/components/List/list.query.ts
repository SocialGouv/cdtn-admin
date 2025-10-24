import { gql, useQuery } from "urql";
import { Infographic } from "../../type";

export const listInfographicsQuery = gql`
  query ListInfographics($search: String) {
    infographics: infographic_infographic(
      where: { title: { _ilike: $search } }
      order_by: { updatedAt: desc }
    ) {
      id
      title
      displayDate
      svgFile {
        url
      }
    }
  }
`;

export type InfographicResult = Pick<
  Infographic,
  "id" | "title" | "displayDate" | "svgFile"
>;

export type QueryResult = {
  infographics: InfographicResult[];
};

export type InfographicListQueryProps = {
  search?: string;
};

export type InfographicListQueryResult = {
  rows: InfographicResult[];
};

export const useListInfographicQuery = ({
  search,
}: InfographicListQueryProps): InfographicListQueryResult => {
  const [result] = useQuery<QueryResult>({
    query: listInfographicsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      search: (search?.length ?? 0 > 0) ? `%${search}%` : "%",
    },
  });
  return {
    rows: result.data?.infographics ?? [],
  };
};
