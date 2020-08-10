/** @jsx jsx */

import Link from "next/link";
import { useMemo } from "react";
import { useUser } from "src/hooks/useUser";
import { Badge, Box, jsx, Message, NavLink, Text } from "theme-ui";
import { useQuery } from "urql";

import { Li, List } from "../list";

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
  const [result] = useQuery({ context, query: getSourcesQuery });
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
                  shallow
                  href="/alerts/[repo]/[status]"
                  as={`/alerts/${source.repository.replace(/\//g, "–")}/todo`}
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
