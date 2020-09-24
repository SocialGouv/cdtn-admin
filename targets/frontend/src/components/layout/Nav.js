/** @jsx jsx */
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { useUser } from "src/hooks/useUser";
import { Badge, Box, css, jsx, Message, NavLink, Text } from "theme-ui";
import { useQuery } from "urql";

import { Li, List } from "../list";

const getSourcesQuery = `
query getAlerts{
  sources(order_by:{label:asc}) {
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
  const { isAdmin } = useUser();
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
    <Box
      as="nav"
      bg="highlight"
      padding="large"
      sx={{ flexShrink: 0, width: "17.5rem" }}
    >
      <ActiveLink href="/">Accueil</ActiveLink>
      <Box sx={{ paddingTop: "medium" }}>
        {isAdmin && (
          <>
            <Text css={styles.titleSection}>Utilisateurs</Text>
            <List>
              <Li>
                <ActiveLink href="/users">Gestion des utilisateurs</ActiveLink>
              </Li>
            </List>
          </>
        )}
      </Box>
      <Box sx={{ paddingTop: "medium" }}>
        <Text css={styles.titleSection}>Alertes</Text>
        {!fetching && (
          <List>
            {data.sources.map((source) => {
              return (
                <Li key={source.repository}>
                  <ActiveLink
                    href="/alerts/[[...params]]"
                    as={`/alerts/${source.repository.replace(/\//, "_")}`}
                  >
                    {source.label}
                  </ActiveLink>

                  {"  "}
                  {source.alerts.aggregate.count > 0 && (
                    <Badge variant="circle">
                      {source.alerts.aggregate.count}
                    </Badge>
                  )}
                </Li>
              );
            })}
          </List>
        )}
      </Box>
      <Box sx={{ paddingTop: "medium" }}>
        <Text css={styles.titleSection}>Administration</Text>
        <List>
          <Li>
            <Link href="/documents" passHref>
              <NavLink>Documents</NavLink>
            </Link>
          </Li>
        </List>
      </Box>
    </Box>
  );
}

function ActiveLink({ as, children, href }) {
  const router = useRouter();
  const isCurrentRoute = as
    ? router.asPath.startsWith(as)
    : router.asPath === href;
  return (
    <Link shallow href={href} as={as} passHref>
      <NavLink
        sx={{
          color: isCurrentRoute ? "primary" : "text",
        }}
      >
        {children}
      </NavLink>
    </Link>
  );
}

ActiveLink.propTypes = {
  as: PropTypes.string,
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

const styles = css({
  titleSection: {
    fontWeight: "light",
    textTransform: "uppercase",
  },
});
