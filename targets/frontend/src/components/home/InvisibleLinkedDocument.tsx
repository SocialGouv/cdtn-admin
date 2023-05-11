import { HasuraDocument } from "@shared/types";
import { gql } from "@urql/core";
import Link from "next/link";
import { Box, Card, Flex, Message, Text } from "theme-ui";
import { useQuery } from "urql";

export const getGhostDocumentQuery = gql`
  query ghostDocuments {
    relations: document_relations(
      where: {
        b: {
          _or: [
            { is_published: { _eq: false } }
            { is_available: { _eq: false } }
          ]
        }
      }
      order_by: [
        { a: { source: asc } }
        { b: { is_available: asc } }
        { b: { is_published: asc } }
        { b: { source: asc } }
        { b: { title: asc } }
      ]
    ) {
      id
      type
      parent: a {
        cdtn_id
        source
        title
      }
      document: b {
        cdtn_id
        title
        source
        is_available
        is_published
      }
    }
  }
`;

export type ParentRef = Pick<HasuraDocument, "cdtn_id" | "title" | "source">;
export type DocumentRef = Pick<
  HasuraDocument,
  "cdtn_id" | "title" | "source" | "is_available" | "is_published"
>;

export type GhostRelation = {
  type: string;
  id: string;
  parent: DocumentRef;
  document: DocumentRef;
};

export type GhostDocumentQueryResult = {
  relations: GhostRelation[];
};

export function GhostLinkedDocuments(): JSX.Element | null {
  const [result] = useQuery<GhostDocumentQueryResult>({
    query: getGhostDocumentQuery,
    requestPolicy: "cache-and-network",
  });

  const { fetching, error, data } = result;

  if (fetching || data?.relations.length === 0) {
    return null;
  }
  if (error) {
    return (
      <Message>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </Message>
    );
  }
  return (
    <Link href="/ghost-documents" passHref style={{ textDecoration: "none" }}>
      <Card>
        <Flex sx={{ justifyContent: "flex-end" }}>
          <Text
            color="secondary"
            sx={{
              fontSize: "xxlarge",
              fontWeight: "600",
            }}
          >
            {data?.relations.length}
          </Text>
        </Flex>
        <Box>
          <Text sx={{ textAlign: "right" }}>Références inaccessibles</Text>
        </Box>
      </Card>
    </Link>
  );
}
