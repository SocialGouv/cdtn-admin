import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
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
import {
  Content,
  ContentQuery,
  HighLightContent,
  PrequalifiedContent,
} from "src/types";
import Spinner from "@mui/material/CircularProgress";
import { useMutation, useQuery } from "urql";

import deleteContentMutation from "./deleteContent.mutation.graphql";
import editContentMutation from "./editContent.mutation.graphql";
import getContentQuery from "./getContent.query.graphql";
import Box from "@mui/material/Box";
import { theme } from "src/theme";
import {
  getContentRelationIds,
  mapContentRelations,
} from "../../../lib/contenus/utils";

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

  const [{ fetching: updating }, editContent] =
    useMutation(editContentMutation);
  const [{ fetching: deleting }, deleteContent] = useMutation(
    deleteContentMutation
  );
  const [, previewContent] = useMutation(previewContentAction);

  const onSubmit =
    <T,>(mapper: (content: T) => object) =>
    async (contentItem: T): Promise<void> => {
      const variables = mapper(contentItem);
      const result = await editContent(variables, context);
      if (!result) return;
      const { slug: computedSlug, metaDescription: computedMetaDescription } =
        result.data.content;
      if (!result.error) {
        previewContent({
          cdtnId: content?.cdtnId,
          document: {
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
      } else {
        console.error("edition impossible", result.error.message);
      }
    };

  const onSubmitContent = onSubmit<Content>((contentItem: Content) => {
    const relationIds = getContentRelationIds(contentItem.contentRelations);
    const relations = mapContentRelations(
      contentItem.contentRelations,
      router.query.id as string
    );
    return {
      cdtnId: contentItem.cdtnId,
      document: contentItem.document,
      metaDescription:
        contentItem.metaDescription ||
        contentItem.document?.description ||
        contentItem.title,
      relationIds,
      relations,
      slug: contentItem?.slug || slugify(contentItem?.title as string),
      title: contentItem?.title,
    };
  });

  const onSubmitContentMemo = useCallback(onSubmitContent, [
    router,
    data?.content,
    editContent,
    previewContent,
  ]);

  const onSubmitHightlight = onSubmit<HighLightContent>(
    (contentItem: HighLightContent) => {
      const relationIds = getContentRelationIds(contentItem.contentRelations);
      const relations = mapContentRelations(
        contentItem.contentRelations,
        router.query.id as string
      );
      return {
        cdtnId: data?.content?.cdtnId,
        document: {},
        metaDescription: contentItem.metaDescription || contentItem.title,
        relationIds,
        relations,
        slug: contentItem?.slug || slugify(contentItem?.title as string),
        title: contentItem?.title,
      };
    }
  );

  const onSubmitHighlightMemo = useCallback(onSubmitHightlight, [
    router,
    data?.content,
    editContent,
    previewContent,
  ]);

  const onSubmitPrequalified = onSubmit<PrequalifiedContent>(
    (contentItem: PrequalifiedContent) => {
      const relationIds = getContentRelationIds(contentItem.contentRelations);
      const relations = mapContentRelations(
        contentItem.contentRelations,
        router.query.id as string
      );
      return {
        cdtnId: data?.content?.cdtnId,
        document: contentItem.document,
        metaDescription: contentItem.title,
        relationIds,
        relations,
        slug: contentItem?.slug || slugify(contentItem?.title as string),
        title: contentItem?.title,
      };
    }
  );

  const onSubmitPrequalifiedMemo = useCallback(onSubmitPrequalified, [
    router,
    data?.content,
    editContent,
    previewContent,
  ]);

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
            onSubmit={onSubmitContentMemo}
          />
        );
      case SOURCES.HIGHLIGHTS:
        return (
          <HighlightsForm
            content={content as Partial<HighLightContent>}
            loading={updating || deleting}
            onSubmit={onSubmitHighlightMemo}
          />
        );
      case SOURCES.PREQUALIFIED:
        return (
          <PrequalifiedForm
            content={content as Partial<PrequalifiedContent>}
            loading={updating || deleting}
            onSubmit={onSubmitPrequalifiedMemo}
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
                    variant="outlined"
                    onClick={() => setShowDeleteConfirmation(false)}
                  >
                    Annuler
                  </Button>
                </Inline>
              </>
            </Dialog>
            {content?.cdtnId && (
              <>
                <Box
                  sx={{ display: "inline-flex", justifyContent: "flex-end" }}
                >
                  <Button
                    onClick={() => {
                      setShowDeleteConfirmation(true);
                    }}
                  >
                    <IoMdTrash
                      style={{
                        height: theme.sizes.iconSmall,
                        marginRight: theme.space.xsmall,
                        width: theme.sizes.iconSmall,
                      }}
                    />
                    Supprimer le contenu
                  </Button>
                </Box>
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
