/** @jsxImportSource theme-ui */

import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { EditorialContentForm } from "src/components/editorialContent";
import { HighlightsForm } from "src/components/highlights/Form";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { PrequalifiedForm } from "src/components/prequalified/Form";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { previewContentAction } from "src/lib/preview/preview.gql";
import { RELATIONS } from "src/lib/relations";
import { Content, ContentQuery, ContentRelation } from "src/types";
import { Flex, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

import deleteContentMutation from "./deleteContent.mutation.graphql";
import editContentMutation from "./editContent.mutation.graphql";
import getContentQuery from "./getContent.query.graphql";

const context = { additionalTypenames: ["documents", "document_relations"] };

export function EditInformationPage() {
  const router = useRouter();
  const cdtnId = router.query.id;
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [{ fetching, data }] = useQuery<ContentQuery>({
    context,
    query: getContentQuery,
    variables: { cdtnId },
  });

  const content: Content | any = data?.content ?? {};

  const [{ fetching: updating }, editContent] =
    useMutation(editContentMutation);
  const [{ fetching: deleting }, deleteContent] = useMutation(
    deleteContentMutation
  );
  const [, previewContent] = useMutation(previewContentAction);

  const onSubmit = useCallback(
    async (contentItem: Content) => {
      const result = await editContent(
        {
          cdtnId: content?.cdtnId,
          document: contentItem.document,
          metaDescription:
            contentItem.metaDescription ||
            contentItem.document?.description ||
            contentItem.title ||
            content?.metaDescription,
          relationIds: contentItem.contentRelations
            ?.map((relation: ContentRelation) => relation?.relationId)
            .filter(Boolean),
          relations: contentItem.contentRelations?.map(
            (relation, index: number) => ({
              data: { position: index },
              document_a: router.query.id,
              document_b: relation?.content?.cdtnId,
              id: relation?.relationId,
              type: RELATIONS.DOCUMENT_CONTENT,
            })
          ),
          slug: contentItem?.slug || slugify(contentItem?.title as string),
          title: contentItem?.title,
        },
        context
      );
      if (!result) return;
      const { slug: computedSlug, metaDescription: computedMetaDescription } =
        result.data.content;
      if (!result.error) {
        previewContent({
          cdtnId: content?.cdtnId,
          document: {
            ...document,
            metaDescription: computedMetaDescription,
            slug: computedSlug,
            title: content?.title,
          },
          source: content?.source,
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
    deleteContent({ cdtnId: content?.cdtnId }).then((result) => {
      if (!result.error) {
        router.back();
      }
    });
  }

  let ContentForm;
  switch (content?.source) {
    case SOURCES.HIGHLIGHTS:
      ContentForm = HighlightsForm;
      break;
    case SOURCES.EDITORIAL_CONTENT:
      ContentForm = EditorialContentForm;
      break;
    case SOURCES.PREQUALIFIED:
      ContentForm = PrequalifiedForm;
      break;
    default:
      //eslint-disable-next-line react/display-name
      ContentForm = () => <span>Soon...</span>;
  }

  return (
    <Layout
      title={`Éditer ${
        content?.cdtnId
          ? `"${content.title}" (${content.source})`
          : "le contenu"
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
              ariaLabel="Supprimer"
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
            {content?.cdtnId && (
              <>
                <Flex
                  sx={{
                    justifyContent: "flex-end",
                  }}
                  mb="small"
                >
                  <Button
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
                </Flex>
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
