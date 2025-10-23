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
      infoLink: informations_contents_blocks {
        detail: informations_content {
          information {
            id
            title
          }
        }
      }
    }
  }
`;

export type InfographicResult = Pick<
  Infographic,
  "id" | "title" | "displayDate"
> & {
  infoLink: [
    {
      detail: {
        information: {
          id: string;
          title: string;
        };
      };
    },
  ];
};

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
