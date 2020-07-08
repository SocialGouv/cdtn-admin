/** @jsx jsx */

import { jsx, Box, NavLink, Text, Badge, Message } from "theme-ui";
import { useUser } from "src/hooks/useUser";
import Link from "next/link";
import { Li, List } from "../list";
import { useQuery } from "urql";
import { useMemo } from "react";

const getSourcesQuery = `
query getAlerts{
  sources {
    repository,
    label,
    alerts: alerts_aggregate(where: {status: {_eq: "todo"}}) {
      aggregate {
      	count
      }
    }
  }
}
`;

export function Nav() {
  const { user } = useUser();
  const isAdmin = user?.roles.some(({ role }) => role === "admin");
  // https://formidable.com/open-source/urql/docs/basics/document-caching/#adding-typenames
  const context = useMemo(
    () => ({ additionalTypenames: ["alerts", "sources"] }),
    []
  );
  const [result] = useQuery({ query: getSourcesQuery, context });
  const { fetching, data, error } = result;
  if (error) {
    return (
      <Message>
        <pre>{JSON.stringify(error, 0, null)}</pre>
      </Message>
    );
  }
  return (
    <Box as="nav" bg="highlight" padding="large" sx={{ flexBasis: "300px" }}>
      <Box>
        {isAdmin && (
          <>
            <Text>Utilisateurs</Text>
            <List>
              <Li>
                <Link href="/users">
                  <NavLink href="/users">Gestion des utilisateurs</NavLink>
                </Link>
              </Li>
            </List>
          </>
        )}
        <Text>Alertes</Text>
        {!fetching && (
          <List>
            {data.sources.map((source) => (
              <Li key={source.repository}>
                <Link
                  href="/alerts/[repo]"
                  as={`/alerts/${source.repository.replace(/\//g, "–")}#todo`}
                  passHref
                >
                  <NavLink>{source.label}</NavLink>
                </Link>
                {"  "}
                {source.alerts.aggregate.count > 0 && (
                  <Badge variant="circle">
                    {source.alerts.aggregate.count}
                  </Badge>
                )}
              </Li>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
