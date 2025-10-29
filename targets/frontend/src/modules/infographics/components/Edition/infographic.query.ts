import { Infographic } from "../../type";
import { CombinedError, gql, OperationContext, useQuery } from "urql";

export const listInfographicsQuery = gql`
  query SelectInfographic($id: uuid!) {
    infographic: infographic_infographic_by_pk(id: $id) {
      id
      title
      metaTitle
      description
      metaDescription
      createdAt
      updatedAt
      displayDate
      svgFile {
        id
        url
        size
        altText
      }
      pdfFile {
        id
        url
        size
        altText
      }
      transcription
    }
  }
`;

export type InfographicResult = Infographic;

export type QueryResult = {
  infographic: InfographicResult;
};

export type InfographicListQueryProps = {
  id: string;
};

export type InfographicListQueryResult = {
  data?: InfographicResult;
  error?: CombinedError;
  fetching: boolean;
  reexecuteQuery: (opts?: Partial<OperationContext> | undefined) => void;
};

export const useListInfographicQuery = ({
  id
}: InfographicListQueryProps): InfographicListQueryResult => {
  const [{ data, error, fetching }, reexecuteQuery] = useQuery<QueryResult>({
    query: listInfographicsQuery,
    requestPolicy: "cache-and-network",
    variables: {
      id
    }
  });
  return {
    data: data?.infographic,
    error,
    fetching,
    reexecuteQuery
  };
};
