/** @jsxImportSource theme-ui */

import slugify from "@socialgouv/cdtn-slugify";
import { useRouter } from "next/router";
import { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { ThemeForm } from "src/components/themes/Form";
import {
  formatContentsMutation,
  updateContentsMutation,
} from "src/components/themes/updateContentsMutation";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { RELATIONS } from "src/lib/relations";
import { Flex, Message, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getThemeQuery = `
query GetTheme($id: String!) {
  theme: documents_by_pk(cdtn_id: $id) {
    cdtnId: cdtn_id
    title
    metaDescription: meta_description
    document
    childRelations: relation_a(where: {type: {_eq: "${RELATIONS.THEME}"}}) {
      childId: document_b
    }
    contentRelations: relation_a(where: {type: {_eq: "${RELATIONS.THEME_CONTENT}"}}) {
      relationId: id
      position: data(path: "position")
      content: b {
        cdtnId: cdtn_id
        slug
        source
        title
      }
    }
    parentRelations: relation_b {
      parent: a {
        cdtnId: cdtn_id
      }
    }
  }
}
`;

const editThemeMutation = `
mutation EditTheme(
  $cdtnId: String!,
  $document: jsonb!,
  $title: String!,
  $metaDescription: String!,
  $slug: String!
) {
  update_documents_by_pk(
    pk_columns: {cdtn_id: $cdtnId},
    _set: {
      document: $document,
      title: $title,
      meta_description: $metaDescription,
      slug: $slug,
      text: $title
    }) {
    cdtnId: cdtn_id
  }
}
`;

const deleteThemeMutation = `
mutation DeleteTheme($cdtnId: String!) {
  delete_documents_by_pk(cdtn_id: $cdtnId) {
    __typename
    cdtnId: cdtn_id
  }
}
`;

export function EditThemePage() {
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

  async function onSubmit({
    contents = [],
    title,
    metaDescription,
    ...document
  }) {
    let result = await editTheme({
      cdtnId: theme.cdtnId,
      document,
      metaDescription: metaDescription || document.description || title,
      slug: slugify(document.shortTitle || title),
      title,
    });
    if (!result.error) {
      result = await updateContents(
        formatContentsMutation({ contents, themeId: theme.cdtnId })
      );
      if (!result || !result.error) {
        router.push("/themes/[[...id]]", `/themes/${theme.cdtnId}`);
      }
    }
  }

  function onDelete() {
    deleteTheme({ cdtnId: theme.cdtnId }).then((result) => {
      if (!result.error) {
        const parentId = theme.parentRelations[0].parent?.cdtnId;
        router.push(
          "/themes/[[...id]]",
          `/themes${parentId ? `/${parentId}` : ""}`
        );
      }
    });
  }

  // const notFound = !fetching && !deleteResult.fetching && !theme?.cdtnId;

  return (
    <Layout /* errorCode={(notFound && 404) || null} */ title="Éditer le theme">
      <Stack>
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
            {theme?.cdtnId && (
              <>
                <Flex
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                  mb="small"
                >
                  {theme?.childRelations.length ? (
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
                        sx={{
                          height: "iconSmall",
                          mr: "xsmall",
                          width: "iconSmall",
                        }}
                      />
                      Supprimer le thème
                    </Button>
                  )}
                </Flex>
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
            />
          </>
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditThemePage));
