import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { IoIosArrowDropleftCircle, IoMdAdd, IoMdCreate } from "react-icons/io";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { List } from "src/components/themes/List";
import { MapModal } from "src/components/themes/MapModal";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { Box, Card, Flex, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getThemeQuery = `
query getTheme($themeId: String!) {
  themeData: documents_by_pk(cdtn_id: $themeId) {
    cdtnId: cdtn_id
    title
    parentRelations: relation_b(where: {document_a: {_is_null: false}, type: {_eq: "${RELATIONS.THEME}"}}) {
      parent: a {
        cdtnId: cdtn_id
        title
      }
    }
    childRelations: relation_a(where: {type: {_eq: "${RELATIONS.THEME}"}}) {
      id
      position: data(path: "position")
      child: b {
        title
        cdtnId: cdtn_id
      }
    }
  }
}
`;

const getRootThemesQuery = `
query getRootThemes {
  rootThemeRelations: document_relations(where: {document_a: {_is_null: true}, type: {_eq: "${RELATIONS.THEME}"}}) {
    id
    position: data(path: "position")
    child: b {
      title
      cdtnId: cdtn_id
    }
  }
}
`;

const updateThemesPositionMutation = `
mutation updateThemesPosition(
  $objects: [document_relations_insert_input!]!
) {
  insert_document_relations(
    objects: $objects,
    on_conflict: {
      constraint: document_relations_pkey,
      update_columns: data
    }
  ) {
    returning {
      position: data(path: "position")
      id
    }
  }
}
`;

const context = { additionalTypenames: ["documents", "document_relations"] };

export function ThemePage() {
  const router = useRouter();
  const { id: [themeId] = [] } = router.query;

  const [, updateThemesPosition] = useMutation(updateThemesPositionMutation);
  const [{ fetching, data: { themeData } = {} }] = useQuery({
    context,
    pause: !themeId,
    query: getThemeQuery,
    variables: {
      themeId: themeId,
    },
  });
  const [
    { rootFetching, data: { rootThemeRelations } = { rootThemeRelations: [] } },
  ] = useQuery({
    context,
    pause: themeId,
    query: getRootThemesQuery,
  });

  rootThemeRelations.sort(
    (relationA, relationB) => relationA.position - relationB.position
  );

  // const notFound = themeId && !fetching && !themeData?.cdtnId;

  return (
    <Layout
      /* errorCode={(notFound && 404) || null}*/ title={`Gestion des thèmes`}
    >
      <Stack>
        <MapModal />
        {fetching || rootFetching ? (
          <Spinner />
        ) : themeId ? (
          <Card>
            <>
              <Flex sx={{ alignItems: "center", justifyContent: "center" }}>
                <h2>{themeData?.title}</h2>
                <Link href={`/themes/edit/${themeId}`} passHref>
                  <Button as="a" sx={{ ml: "medium" }}>
                    <>
                      <IoMdCreate
                        sx={{
                          flex: "0 0 auto",
                          height: "iconSmall",
                          mr: "xxsmall",
                          width: "iconSmall",
                        }}
                      />
                      Éditer
                    </>
                  </Button>
                </Link>
              </Flex>
              <h3 sx={{ mr: "small" }}>Niveau précédent</h3>
              {themeData?.parentRelations.length === 0 ? (
                <ParentLink>Racine des thèmes</ParentLink>
              ) : (
                themeData?.parentRelations.map(({ parent }) => (
                  <div key={parent.cdtnId}>
                    <ParentLink id={parent.cdtnId}>{parent.title}</ParentLink>
                  </div>
                ))
              )}

              <h3 sx={{ mt: "medium" }}>Sous-thèmes</h3>
            </>
            <List
              relations={
                themeId ? themeData?.childRelations : rootThemeRelations
              }
              updateThemesPosition={updateThemesPosition}
            />
            <AddAThemeButton themeId={themeId} />
          </Card>
        ) : (
          <div>
            <List
              relations={
                themeId ? themeData?.childRelations : rootThemeRelations
              }
              updateThemesPosition={updateThemesPosition}
            />
            <AddAThemeButton themeId={themeId} />
          </div>
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(ThemePage));

const AddAThemeButton = ({ themeId }) => (
  <Box sx={{ mt: "medium" }}>
    <Link href={`/themes/${themeId ? `${themeId}/` : ""}create`} passHref>
      <Button as="a" sx={{ mr: "medium" }}>
        <IoMdAdd
          sx={{ height: "iconMedium", mr: "xxsmall", width: "iconMedium" }}
        />
        Ajouter un thème ici
      </Button>
    </Link>
  </Box>
);

AddAThemeButton.propTypes = {
  themeId: PropTypes.string,
};

const ParentLink = ({ id, ...props }) => (
  <Link href={`/themes${id ? `/${id}` : ""}`} passHref>
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
            height: "iconMedium",
            mr: "small",
            width: "iconMedium",
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
