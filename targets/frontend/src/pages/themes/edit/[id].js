/** @jsx jsx  */

import { useRouter } from "next/router";
import { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import {
  formatContentsMutation,
  updateContentsMutation,
} from "src/components/themes/common";
import { ThemeForm } from "src/components/themes/Form";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useUser } from "src/hooks/useUser";
import { jsx, Message, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getThemeQuery = `
query GetTheme($id: uuid!) {
  theme:themes_by_pk(id: $id) {
    id
    title
    shortTitle: short_title
    description
    isSpecial: is_special
    isPublished: is_published
    icon
    children {
      child
    }
    contents {
      relationId: id
      themePosition: theme_position
      content {
        cdtnId: cdtn_id
        slug
        source
        title
        url
      }
    }
    parents(where: {is_weak: {_eq: false}}) {
      parentTheme: parent_theme {
        title
        id
      }
    }
  }
}
`;

const editThemeMutation = `
mutation EditTheme(
  $id: uuid!,
  $title: String!,
  $shortTitle: String = null,
  $description: String = null,
  $icon: String = null,
  $isSpecial: Boolean = false,
  $isPublished: Boolean = true
) {
  update_themes_by_pk(
    pk_columns: {id: $id},
    _set: {
      title: $title,
      short_title: $shortTitle,
      description: $description,
      icon: $icon,
      is_special: $isSpecial,
      is_published: $isPublished
    }
  ) {
    __typename
    id
  }
}
`;

const deleteThemeMutation = `
mutation DeleteTheme($id: uuid!) {
  delete_themes_by_pk(id: $id) {
    __typename
    id
  }
}
`;

export function EditThemePage() {
  const { isAdmin } = useUser();
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [{ fetching, data: { theme } = {} }] = useQuery({
    query: getThemeQuery,
    requestPolicy: "network-only",
    variables: { id: router.query.id },
  });
  const [editResult, editTheme] = useMutation(editThemeMutation);
  const [updateContentsResult, updateContents] = useMutation(
    updateContentsMutation
  );
  const [deleteResult, deleteTheme] = useMutation(deleteThemeMutation);

  async function onSubmit({ contents = [], ...data }) {
    let result = await editTheme({ id: theme.id, ...data });
    if (!result.error) {
      result = await updateContents(
        formatContentsMutation({ contents, themeId: theme.id })
      );
      if (!result || !result.error) {
        router.push("/themes/[[...id]]", `/themes/${theme.id}`);
      }
    }
  }

  function onDelete() {
    deleteTheme({ id: theme.id }).then((result) => {
      if (!result.error) {
        console.log(theme.parents);
        const parentId = theme.parents[0].parentTheme?.id;
        router.push(
          "/themes/[[...id]]",
          `/themes${parentId ? `/${parentId}` : ""}`
        );
      }
    });
  }

  const notFound = !fetching && !theme?.id;

  const pageTitle = `${isAdmin ? "Modifier" : "Consulter"} le thème`;

  return (
    <Layout errorCode={(notFound && 404) || null} title={pageTitle}>
      {fetching ? (
        <Spinner />
      ) : (
        <>
          <Dialog
            isOpen={showDeleteConfirmation}
            onDismiss={() => setShowDeleteConfirmation(false)}
            aria-label="Supprimer"
          >
            <>
              <span>Êtes-vous sûr de vouloir supprimer ce thème ?</span>
              <Inline>
                <Button onClick={onDelete}>Confirmer</Button>
                <Button
                  variant="link"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Annuler
                </Button>
              </Inline>
            </>
          </Dialog>
          {theme?.id && isAdmin && (
            <>
              <div
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: "small",
                }}
              >
                {theme?.children.length && isAdmin ? (
                  <Message variant="secondary">
                    Supprimez les sous-thèmes de ce thème avant de pouvoir le
                    supprimer
                  </Message>
                ) : (
                  <Button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirmation(true);
                    }}
                  >
                    <IoMdTrash
                      sx={{ height: "1.5rem", mr: "xsmall", width: "1.5rem" }}
                    />
                    Supprimer le thème
                  </Button>
                )}
              </div>
            </>
          )}
          <ThemeForm
            theme={theme}
            loading={
              editResult.fetching ||
              updateContentsResult.fetching ||
              deleteResult.fetching
            }
            onSubmit={onSubmit}
            onDelete={onDelete}
          />
        </>
      )}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditThemePage));
