import { useQuery } from "urql";

const prequalifiedQuery = `
query get_prequalified_by_id($id: uuid) {
    search_prequalified (where: {id: {_eq: $id}}) {
      id
      variants
      documents {
        document {
          cdtnId: cdtn_id
          title
        }
      }
    }
  }
`;

type QueryProps = {
  id: string;
};

type PrequalifiedDocument = {
  cdtnId: string;
  title: string;
};

type Prequalified = {
  id: string;
  variants: string[];
  documents: {
    document: PrequalifiedDocument;
  }[];
};

type QueryResult = {
  search_prequalified: Prequalified[];
};

export type PrequalifiedResult = {
  id: string;
  variants: string[];
  documents: PrequalifiedDocument[];
};

export const usePrequalifiedQuery = ({
  id,
}: QueryProps): PrequalifiedResult | undefined => {
  const [result] = useQuery<QueryResult>({
    query: prequalifiedQuery,
    variables: {
      id,
    },
  });

  if (
    !result?.data?.search_prequalified ||
    !result?.data?.search_prequalified?.length
  ) {
    return;
  }
  const data = result.data?.search_prequalified[0];
  if (!data) {
    return;
  }
  const { documents, ...props } = data;

  return {
    ...props,
    documents: documents.map(({ document }) => document),
  };
};
