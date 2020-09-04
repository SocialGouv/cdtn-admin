/** @jsx jsx  */

import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { IoIosArrowDropleftCircle, IoMdAdd, IoMdCreate } from "react-icons/io";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { List } from "src/components/themes/List";
import { MapModal } from "src/components/themes/MapModal";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useUser } from "src/hooks/useUser";
import { Box, Card, Flex, jsx, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getThemesQuery = `
query getTheme($themeId: uuid!) {
  themes_by_pk(id: $themeId) {
    title
    id
    parents(order_by: {position: asc}, where: {parent: {_is_null: false}}) {
      parentTheme: parent_theme {
        title
        id
      }
    }
    children(order_by: {position: asc}) {
      id
      childTheme: child_theme {
        title
        id
      }
    }
  }
}
`;
const getRootThemesQuery = `
query getRootThemes {
  theme_relations(order_by: {position: asc}, where: {parent: {_is_null: true}}) {
    id
    childTheme: child_theme {
      title
      id
    }
  }
}

`;

const updateThemesPositionMutation = `
mutation updateThemesPosition(
  $objects: [theme_relations_insert_input!]!
) {
  insert_theme_relations(
    objects: $objects,
    on_conflict: {
      constraint: theme_relations_pkey,
      update_columns: position
    }
  ) {
    returning {
      position
      id
    }
  }
}
`;

const context = { additionalTypenames: ["themes", "theme_relations"] };

export function ThemePage() {
  const router = useRouter();
  const { isAdmin } = useUser();
  const { id: [themeId] = [] } = router.query;

  const [, updateThemesPosition] = useMutation(updateThemesPositionMutation);
  const [{ fetching, data: { themes_by_pk: themeData } = {} }] = useQuery({
    context,
    pause: !themeId,
    query: getThemesQuery,
    variables: {
      themeId: themeId,
    },
  });
  const [
    {
      rootFetching,
      data: { theme_relations: rootThemeData } = { theme_relations: [] },
    },
  ] = useQuery({
    context,
    pause: themeId,
    query: getRootThemesQuery,
  });

  const notFound = themeId && !fetching && !themeData?.id;

  return (
    <Layout errorCode={(notFound && 404) || null} title={`Gestion des thèmes`}>
      <MapModal />
      {fetching || rootFetching ? (
        <Spinner />
      ) : themeId ? (
        <Card>
          <>
            <Flex sx={{ alignItems: "center", justifyContent: "center" }}>
              <h2>{themeData?.title}</h2>
              <Link
                href="/themes/edit/[id]"
                as={`/themes/edit/${themeId}`}
                passHref
              >
                <Button as="a" sx={{ ml: "medium" }}>
                  <IoMdCreate
                    sx={{ height: "2rem", mr: "xxsmall", width: "2rem" }}
                  />
                  Éditer
                </Button>
              </Link>
            </Flex>
            <h3 sx={{ mr: "small" }}>Niveau précédent</h3>
            {themeData?.parents.length === 0 ? (
              <ParentLink>Racine des thèmes</ParentLink>
            ) : (
              themeData?.parents.map(({ parentTheme }) => (
                <div key={parentTheme.id}>
                  <ParentLink id={parentTheme.id}>
                    {parentTheme.title}
                  </ParentLink>
                </div>
              ))
            )}

            <h3 sx={{ mt: "medium" }}>Sous-thèmes</h3>
          </>
          <List
            relations={themeId ? themeData?.children : rootThemeData}
            updateThemesPosition={updateThemesPosition}
          />
          {isAdmin && <AddAThemeButton themeId={themeId} />}
        </Card>
      ) : (
        <div>
          <List
            relations={themeId ? themeData?.children : rootThemeData}
            updateThemesPosition={updateThemesPosition}
          />
          {isAdmin && <AddAThemeButton themeId={themeId} />}
        </div>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ThemePage));

const AddAThemeButton = ({ themeId }) => (
  <Box sx={{ mt: "medium" }}>
    <Link
      href="/themes/create/[[...id]]"
      as={`/themes/create${themeId ? `/${themeId}` : ""}`}
      passHref
    >
      <Button as="a" sx={{ mr: "medium" }}>
        <IoMdAdd sx={{ height: "2rem", mr: "xxsmall", width: "2rem" }} />
        Ajouter un thème ici
      </Button>
    </Link>
  </Box>
);

AddAThemeButton.propTypes = {
  themeId: PropTypes.string,
};

const ParentLink = ({ id, ...props }) => (
  <Link href="/themes/[[...id]]" as={`/themes${id ? `/${id}` : ""}`} passHref>
    <Card
      as="a"
      sx={{
        ":hover": { boxShadow: "cardHover" },
        ":link, :visited": { color: "text" },
        color: "text",
        cursor: "pointer",
        display: "block",
        mb: "small",
        textDecoration: "none",
      }}
    >
      <Flex sx={{ alignItems: "center" }}>
        <IoIosArrowDropleftCircle
          sx={{
            color: "secondary",
            height: "2rem",
            mr: "small",
            width: "2rem",
          }}
        />
        <div {...props} />
      </Flex>
    </Card>
  </Link>
);

ParentLink.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
};
