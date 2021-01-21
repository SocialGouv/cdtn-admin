import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { EditorialContentForm } from "src/components/editorialContent/Form";
import { HighlightsForm } from "src/components/highlights/Form";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { previewContentAction } from "src/lib/preview/preview.gql";
import { RELATIONS } from "src/lib/relations";
import { Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

const getContentQuery = `
query getContent($cdtnId: String!) {
  content: documents_by_pk(cdtn_id: $cdtnId) {
    cdtnId: cdtn_id
    title
    slug
    source
    document
    metaDescription: meta_description
    contentRelations: relation_a(where: {type: {_eq: "${RELATIONS.DOCUMENT_CONTENT}"}}) {
      relationId: id
      position: data(path: "position")
      content: b {
        cdtnId: cdtn_id
        slug
        source
        title
      }
    }
  }
}
`;

const editContentMutation = `
mutation editContent(
  $cdtnId: String!,
  $document: jsonb!,
  $title: String!,
  $metaDescription: String!,
  $slug: String!
  $relations: [document_relations_insert_input!]!,
  $relationIds: [uuid!]!,
) {
  content: update_documents_by_pk(
    pk_columns: {cdtn_id: $cdtnId},
    _set: {
      document: $document,
      title: $title,
      meta_description: $metaDescription,
      slug: $slug,
      text: $title
    }) {
    slug
    metaDescription: meta_description
  }
  delete_document_relations(
    where: {
      id: {_nin: $relationIds},
      document_a: {_eq: $cdtnId},
      type: {_eq: "${RELATIONS.DOCUMENT_CONTENT}"}
    }
    ) {
    affected_rows
  }
  insert_document_relations(
    objects: $relations,
    on_conflict: {
      constraint: document_relations_pkey,
      update_columns: data
    }
    ) {
    affected_rows
  }
}
`;

const deleteContentMutation = `
mutation DeleteContent($cdtnId: String!) {
  content: delete_documents_by_pk(cdtn_id: $cdtnId) {
    cdtnId: cdtn_id
  }
}
`;

const context = { additionalTypenames: ["documents", "document_relations"] };

export function EditInformationPage() {
  const router = useRouter();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [{ fetching, data: { content = {} } = {} }] = useQuery({
    context,
    query: getContentQuery,
    variables: { cdtnId: router.query.id },
  });

  const [{ fetching: updating }, editContent] = useMutation(
    editContentMutation
  );
  const [{ fetching: deleting }, deleteContent] = useMutation(
    deleteContentMutation
  );
  const [, previewContent] = useMutation(previewContentAction);

  const onSubmit = useCallback(
    async ({ title, slug, metaDescription, document = {}, contents = [] }) => {
      const result = await editContent(
        {
          cdtnId: content.cdtnId,
          document,
          metaDescription:
            metaDescription ||
            document.description ||
            title ||
            content.metaDescription,
          relationIds: contents
            .map(({ relationId }) => relationId)
            .filter(Boolean),
          relations: contents.map(({ relationId, cdtnId }, index) => ({
            data: { position: index },
            document_a: router.query.id,
            document_b: cdtnId,
            id: relationId,
            type: RELATIONS.DOCUMENT_CONTENT,
          })),
          slug: slug || slugify(title),
          title,
        },
        context
      );
      const {
        slug: computedSlug,
        metaDescription: computedMetaDescription,
      } = result.data.content;
      if (!result.error) {
        previewContent({
          cdtnId: content.cdtnId,
          document: {
            ...document,
            metaDescription: computedMetaDescription,
            slug: computedSlug,
            title,
          },
          source: content.source,
        }).then((response) => {
          if (response.error) {
            console.error("preview impossible", response.error.message);
          }
        });
        router.back();
      } else {
        console.error("edition impossible", result.error.message);
      }
    },
    [router, content, editContent, previewContent]
  );

  function onDelete() {
    deleteContent({ cdtnId: content.cdtnId }).then((result) => {
      if (!result.error) {
        router.back();
      }
    });
  }

  let ContentForm;
  switch (content.source) {
    case SOURCES.HIGHLIGHTS:
      ContentForm = HighlightsForm;
      break;
    case SOURCES.EDITORIAL_CONTENT:
      ContentForm = EditorialContentForm;
      break;
    default:
      //eslint-disable-next-line react/display-name
      ContentForm = () => <span>Soon...</span>;
  }

  return (
    <Layout
      title={`Éditer ${
        content.cdtnId ? `"${content.title}" (${content.source})` : "le contenu"
      }`}
    >
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
            {content.cdtnId && (
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
                <ContentForm
                  content={content}
                  loading={updating || deleting}
                  onSubmit={onSubmit}
                />
              </>
            )}
          </>
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
