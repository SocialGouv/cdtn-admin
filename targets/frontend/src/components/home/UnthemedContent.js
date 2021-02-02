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

export function UnThemedContent() {
  const [result] = useQuery({
    query: getUnthemedContentQuery,
    variables: {
      themeSources: [
        SOURCES.SHEET_MT_PAGE,
        SOURCES.SHEET_SP,
        SOURCES.CONTRIBUTIONS,
        SOURCES.EDITORIAL_CONTENT,
        SOURCES.LETTERS,
        SOURCES.EXTERNALS,
        SOURCES.TOOLS,
      ],
    },
  });

  const { data, fetching, error } = result;

  if (fetching) {
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
            <Text> Contenus non thémés</Text>
          </Box>
        </Card>
      </NavLink>
    </Link>
  );
}
