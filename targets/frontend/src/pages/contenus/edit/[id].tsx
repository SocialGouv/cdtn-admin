/** @jsxImportSource theme-ui */

import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { NextRouter, useRouter } from "next/router";
import { useCallback, useState } from "react";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { EditorialContentForm } from "src/components/editorialContent";
import { HighlightsForm } from "src/components/highlights";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { PrequalifiedForm } from "src/components/prequalified";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { previewContentAction } from "src/lib/preview/preview.gql";
import { RELATIONS } from "src/lib/relations";
import {
  Content,
  ContentQuery,
  ContentRelation,
  HighLightContent,
  PrequalifiedContent,
} from "src/types";
import { Flex, Spinner } from "theme-ui";
import { useMutation, useQuery } from "urql";

import deleteContentMutation from "./deleteContent.mutation.graphql";
import editContentMutation from "./editContent.mutation.graphql";
import getContentQuery from "./getContent.query.graphql";

const context = { additionalTypenames: ["documents", "document_relations"] };

function getContentRelationIds(
  content: Content | PrequalifiedContent | HighLightContent
) {
  return content.contentRelations
    ?.map((relation: ContentRelation) => relation?.relationId)
    .filter(Boolean);
}

function mapContentRelations(
  content: Content | PrequalifiedContent | HighLightContent,
  queryId: string
) {
  return content.contentRelations?.map(
    (relation: ContentRelation, index: number) => ({
      data: { position: index },
      document_a: queryId,
      document_b: relation?.content?.cdtnId,
      id: relation?.relationId,
      type: RELATIONS.DOCUMENT_CONTENT,
    })
  );
}

export function EditInformationPage() {
  const router = useRouter();
  const cdtnId = router.query.id;
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [{ fetching, data }] = useQuery<ContentQuery>({
    context,
    query: getContentQuery,
    variables: { cdtnId },
  });

  const [{ fetching: updating }, editContent] =
    useMutation(editContentMutation);
  const [{ fetching: deleting }, deleteContent] = useMutation(
    deleteContentMutation
  );
  const [, previewContent] = useMutation(previewContentAction);

  const onSubmitContent = useCallback(
    async (contentItem: Content) => {
      const relationIds = getContentRelationIds(contentItem);
      const relations = mapContentRelations(
        contentItem,
        router.query.id as string
      );
      const result = await editContent(
        {
          cdtnId: data?.content?.cdtnId,
          document: contentItem.document,
          metaDescription:
            contentItem.metaDescription ||
            contentItem.document?.description ||
            contentItem.title,
          relationIds,
          relations,
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
    [router, data?.content, editContent, previewContent]
  );

  const onSubmitHighlight = useCallback(
    async (contentItem: HighLightContent) => {
      const relationIds = getContentRelationIds(contentItem);
      const relations = mapContentRelations(
        contentItem,
        router.query.id as string
      );
      const result = await editContent(
        {
          cdtnId: data?.content?.cdtnId,
          metaDescription: contentItem.metaDescription || contentItem.title,
          relationIds,
          relations,
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
    [router, data?.content, editContent, previewContent]
  );

  const onSubmitPrequalified = useCallback(
    async (contentItem: PrequalifiedContent) => {
      const relationIds = getContentRelationIds(contentItem);
      const relations = mapContentRelations(
        contentItem,
        router.query.id as string
      );
      const result = await editContent(
        {
          cdtnId: data?.content?.cdtnId,
          metaDescription: contentItem.title,
          relationIds,
          relations,
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
          cdtnId: data?.content?.cdtnId,
          document: {
            ...document,
            metaDescription: computedMetaDescription,
            slug: computedSlug,
            title: data?.content?.title,
          },
          source: data?.content?.source,
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
    [router, data?.content, editContent, previewContent]
  );

  if (!data?.content) {
    return <span>Chargement...</span>;
  }

  const content: Partial<Content | PrequalifiedContent | HighLightContent> =
    data.content;

  function onDelete() {
    deleteContent({ cdtnId: content?.cdtnId }).then((result) => {
      if (!result.error) {
        router.back();
      }
    });
  }

  function renderForm() {
    if (!content?.source) return <span>Soon...</span>;
    switch (content?.source as string) {
      case SOURCES.EDITORIAL_CONTENT:
        return (
          <EditorialContentForm
            content={content as Partial<Content>}
            loading={updating || deleting}
            onSubmit={onSubmitContent}
          />
        );
      case SOURCES.HIGHLIGHTS:
        return (
          <HighlightsForm
            content={content as Partial<HighLightContent>}
            loading={updating || deleting}
            onSubmit={onSubmitHighlight}
          />
        );
      case SOURCES.PREQUALIFIED:
        return (
          <PrequalifiedForm
            content={content as Partial<PrequalifiedContent>}
            loading={updating || deleting}
            onSubmit={onSubmitPrequalified}
          />
        );
      default:
        //eslint-disable-next-line react/display-name
        return <span>Chargement...</span>;
    }
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
                {renderForm()}
              </>
            )}
          </>
        )}
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
