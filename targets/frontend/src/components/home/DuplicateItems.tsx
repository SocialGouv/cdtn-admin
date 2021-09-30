import { HasuraDocument } from "@shared/types";
import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RELATIONS } from "src/lib/relations";
import { Box, Card, Flex, Message, NavLink, Text } from "theme-ui";
import { useQuery } from "urql";

export const getDuplicateQuery = `query duplicate($sources: [String!], $relationTypes: [String!]) {
  documents(
    where: {
      source: { _in:  $sources }
      is_available: { _eq: true }
      is_published: { _eq: true }
    }
  ) {
    relations: relation_a(where: { type: { _in: $relationTypes } }) {
      type
      data
      id
      parent: a {
        source
        title
        cdtn_id
      }
      document: b {
        source
        title
        cdtn_id
      }
    }
  }
}`;

export type DuplicateContentResult = {
  documents: DuplicateDocument[];
};
export type DuplicateDocument = {
  relations: Relation[];
};
type DocumentRef = Pick<HasuraDocument, "source" | "cdtn_id" | "title">;
export type Relation = {
  type: string;
  data: Data;
  id: string;
  parent: DocumentRef;
  document: DocumentRef;
};

export type Data = {
  position: number;
};

export function DuplicateContent(): JSX.Element | null {
  const [duplicates, setDuplicates] = useState<Relation[]>([]);
  const [result] = useQuery<DuplicateContentResult>({
    query: getDuplicateQuery,
    requestPolicy: "cache-and-network",
    variables: {
      relationTypes: [RELATIONS.DOCUMENT_CONTENT, RELATIONS.THEME_CONTENT],
      sources: [SOURCES.THEMES, SOURCES.PREQUALIFIED],
    },
  });

  useEffect(() => {
    function getDoublons(t: DuplicateDocument) {
      const map = new Map();
      const found = [];
      for (const relation of t.relations) {
        if (map.has(relation.document.cdtn_id)) {
          if (map.get(relation.document.cdtn_id) === false) {
            found.push(relation);
          }
          map.set(relation.document.cdtn_id, true);
        } else {
          map.set(relation.document.cdtn_id, false);
        }
      }
      return found;
    }
    const duplicateDocs =
      result?.data?.documents.flatMap((t) => {
        const duplicates = getDoublons(t);
        if (duplicates.length > 0) {
          return duplicates;
        }
        return [];
      }) || [];
    setDuplicates(duplicateDocs);
  }, [result.data, setDuplicates]);

  const { fetching, error } = result;

  if (fetching) {
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
    <Link href="/duplicates" passHref>
      <NavLink>
        <Card>
          <Flex sx={{ justifyContent: "flex-end" }}>
            <Text
              color="secondary"
              sx={{
                fontSize: "xxlarge",
                fontWeight: "600",
              }}
            >
              {duplicates.length}
            </Text>
          </Flex>
          <Box>
            <Text>documents avec des doublons</Text>
          </Box>
        </Card>
      </NavLink>
    </Link>
  );
}
