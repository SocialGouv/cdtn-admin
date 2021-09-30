import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { RELATIONS } from "src/lib/relations";
import { Box, Card, Flex, Message, NavLink, Text } from "theme-ui";
import { useQuery } from "urql";

export const getUnthemedContentQuery = `
query getUnthemed($themeSources: [String!]!) {
  documents (where: {
    is_available: {_eq: true}
    is_published: {_eq: true}
    source: {
      _in: $themeSources
    }
    _and: [
      {_not: {
        relation_b: {type: {_eq: "${RELATIONS.THEME_CONTENT}"} a :{source: {_eq: "${SOURCES.THEMES}"}} }
      }}
      {_not: {document: {_has_key: "split"}}}
    ]

  }) {
    source
    slug
    title
    cdtnId: cdtn_id
  }
}
`;

export const THEMABLE_CONTENT = [
  SOURCES.CONTRIBUTIONS,
  SOURCES.EDITORIAL_CONTENT,
  SOURCES.EXTERNALS,
  SOURCES.LETTERS,
  SOURCES.SHEET_MT_PAGE,
  SOURCES.SHEET_SP,
  SOURCES.THEMATIC_FILES,
  SOURCES.TOOLS,
];

export function UnThemedContent() {
  const [result] = useQuery({
    query: getUnthemedContentQuery,
    variables: {
      themeSources: THEMABLE_CONTENT,
    },
  });

  const { data, fetching, error } = result;

  if (fetching || data?.documents.length === 0) {
    return null;
  }
  if (error) {
    return (
      <Message>
        <pre>{JSON.stringify(error, 2)}</pre>
      </Message>
    );
  }
  return (
    <Link href="/unthemed" passHref>
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
              {data.documents.length}
            </Text>
          </Flex>
          <Box>
            <Text sx={{ textAlign: "right" }}>Contenus non thémés</Text>
          </Box>
        </Card>
      </NavLink>
    </Link>
  );
}
