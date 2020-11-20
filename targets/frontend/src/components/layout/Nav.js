/** @jsx jsx */
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { useUser } from "src/hooks/useUser";
import { Badge, Box, jsx, Message, NavLink, Text } from "theme-ui";
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
      sx={{ flexShrink: 0, width: "17rem" }}
    >
      <ActiveLink href="/">Accueil</ActiveLink>
      <Box sx={{ paddingTop: "medium" }}>
        {isAdmin && (
          <>
            <Text sx={TitleStyles}>Utilisateurs</Text>
            <List>
              <Li>
                <ActiveLink href="/users">Gestion des utilisateurs</ActiveLink>
              </Li>
            </List>
          </>
        )}
      </Box>
      <Box sx={{ paddingTop: "medium" }}>
        <Text sx={TitleStyles}>Alertes</Text>
        {!fetching && (
          <List>
            {data.sources.map((source) => {
              return (
                <Li key={source.repository}>
                  <ActiveLink
                    href={`/alerts/${source.repository.replace(/\//, "_")}`}
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
        <Text sx={TitleStyles}>Administration</Text>
        <List>
          <Li>
            <ActiveLink href="/contenus" passHref>
              Contenus
            </ActiveLink>
          </Li>
          <Li>
            <ActiveLink href="/glossary" passHref>
              Glossaire
            </ActiveLink>
          </Li>
          <Li>
<<<<<<< HEAD
            <ActiveLink href="/themes" passHref>
              Thèmes
||||||| parent of dcbcac1... fix(frontend): update rereshToken
            <ActiveLink href="/themes/[[...id]]" as="/themes" passHref>
              <NavLink>Thèmes</NavLink>
=======
            <ActiveLink href="/themes/[[...id]]" as="/themes" passHref>
              Thèmes
>>>>>>> dcbcac1... fix(frontend): update rereshToken
            </ActiveLink>
          </Li>
          <Li>
            <ActiveLink href="/kali/blocks" passHref>
              Blocs KALI
            </ActiveLink>
          </Li>
        </List>
      </Box>
    </Box>
  );
}

function ActiveLink({ children, href }) {
  const router = useRouter();
  const isCurrentRoute = router.asPath.startsWith(href);
  return (
    <Link shallow href={href} passHref>
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
  children: PropTypes.node.isRequired,
  href: PropTypes.string.isRequired,
};

const TitleStyles = {
  fontWeight: "light",
  textTransform: "uppercase",
};
