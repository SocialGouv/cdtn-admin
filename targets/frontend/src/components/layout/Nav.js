/** @jsx jsx */
import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { useUser } from "src/hooks/useUser";
import { slugifyRepository } from "src/models";
import { Badge, Box, jsx, Message, NavLink, Text } from "theme-ui";
import { useQuery } from "urql";

import { Li, List } from "../list";

const CONTAINER_NAME = process.env.NEXT_PUBLIC_CONTAINER_NAME || "cdtn-dev";

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
                    href={`/alerts/${slugifyRepository(source.repository)}`}
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
            <ActiveLink href="/contenus?source=information" passHref>
              Contenus éditoriaux
            </ActiveLink>
          </Li>
          <Li>
            <ActiveLink href="/glossary" passHref>
              Glossaire
            </ActiveLink>
          </Li>
          <Li>
            <ActiveLink href="/themes" passHref>
              Thèmes
            </ActiveLink>
          </Li>
          <Li>
            <ActiveLink href="/kali/blocks" passHref>
              Blocs KALI
            </ActiveLink>
          </Li>
          <Li>
            <ActiveLink href={`/storage/${CONTAINER_NAME}`} passHref>
              Fichiers {process.env.NEXT_PUBLIC_CONTAINER_NAME}
            </ActiveLink>
          </Li>
        </List>
      </Box>
    </Box>
  );
}

// used to make sure two links are not highlighted at the same time
const subRouteSources = [SOURCES.EDITORIAL_CONTENT];

function ActiveLink({ children, href }) {
  const router = useRouter();
  const [pathname, query = ""] = href.split("?");
  let isCurrentRoute = router.pathname === pathname;
  if (isCurrentRoute) {
    if (query) {
      isCurrentRoute = query.includes(router.query?.source);
    } else {
      /** when href is "/contenus" and current url is
       * "/contenus?source=editorial_content" we don't want to highlight
       * this generic link since there is a more specific link that match the
       * current url`. We ensure taht source param is not included in the
       * specific sources.
       * url | href | highlighted
       * - | - | -
       * /contenus?source=editorial_content` | /contenus | :cross:
       * /contenus?source=contributions` | /contenus | :check:
       **/

      isCurrentRoute = !subRouteSources.includes(router.query?.source);
    }
  }

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
