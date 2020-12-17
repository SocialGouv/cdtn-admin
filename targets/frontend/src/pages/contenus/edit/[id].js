/** @jsx jsx  */
import slugify from "@socialgouv/cdtn-slugify";
import { useRouter } from "next/router";
import { useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { EditorialContentForm } from "src/components/editorialContent/Form";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { previewContentAction } from "src/lib/preview/preview.gql";
import { jsx, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getEditorialContentQuery = `
query getEditorialContent($cdtnId: String!) {
  editorialContent: documents_by_pk(cdtn_id: $cdtnId) {
    cdtnId: cdtn_id
    title
    source
    document
    metaDescription: meta_description
  }
}
`;

const editEditorialContentMutation = `
mutation EditEditorialContent(
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
    slug
    source
    metaDescription: meta_description
  }
}
`;

const deleteEditorialContentMutation = `
mutation DeleteEditorialContent($cdtnId: String!) {
  delete_documents_by_pk(cdtn_id: $cdtnId) {
    cdtnId: cdtn_id
  }
}
`;

export function EditInformationPage() {
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [{ fetching, data: { editorialContent } = {} }] = useQuery({
    query: getEditorialContentQuery,
    requestPolicy: "network-only",
    variables: { cdtnId: router.query.id },
  });
  const [editResult, editEditorialContent] = useMutation(
    editEditorialContentMutation
  );
  const [deleteResult, deleteEditorialContent] = useMutation(
    deleteEditorialContentMutation
  );
  const [, previewContent] = useMutation(previewContentAction);

  async function onSubmit({ title, metaDescription, document }) {
    const result = await editEditorialContent({
      cdtnId: editorialContent.cdtnId,
      document,
      metaDescription: metaDescription || document.description || title,
      slug: slugify(title),
      title,
    });

    previewContent({
      cdtnId: result.cdtnId,
      document: {
        ...document,
        metaDescription: result.metaDescription,
        slug: result.slug,
        title,
      },
      source: result.source,
    }).then((response) => {
      if (response.error) {
        console.error("preview impossible", response.error.message);
      }
    });

    if (!result.error) {
      router.back();
    }
  }

  function onDelete() {
    deleteEditorialContent({ cdtnId: editorialContent.cdtnId }).then(
      (result) => {
        if (!result.error) {
          router.back();
        }
      }
    );
  }

  return (
    <Layout title="Éditer le contenu">
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
                <span>Êtes-vous sûr de vouloir supprimer ce contenu ?</span>
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
            {editorialContent?.cdtnId && (
              <>
                <div
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: "small",
                  }}
                >
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
                    Supprimer le contenu
                  </Button>
                </div>
              </>
            )}
            <EditorialContentForm
              editorialContent={editorialContent}
              loading={editResult.fetching || deleteResult.fetching}
              onSubmit={onSubmit}
            />
          </>
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
