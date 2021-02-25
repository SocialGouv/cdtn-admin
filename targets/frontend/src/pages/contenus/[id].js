import { SOURCES } from "@socialgouv/cdtn-sources";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdTrash } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { previewContentAction } from "src/lib/preview/preview.gql";
import { Card, Flex, Message, NavLink } from "theme-ui";
import { useMutation, useQuery } from "urql";

const CodeWithCodemirror = dynamic(import("src/components/editor/CodeEditor"), {
  ssr: false,
});

const getDocumentQuery = `
query getDocumentById($id: String!) {
  document: documents_by_pk(cdtn_id: $id){
    cdtnId: cdtn_id,
    document
    initial_id
    is_published
    is_searchable
    is_available
    meta_description
    slug
    source
    text
    title
  }
}
`;

const updateDocumentMutation = `
mutation updateDocument($cdtnId: String!, $metaDescription: String!, $title: String!, $isAvailable: Boolean!, $document: jsonb!, $text: String!){
  document: update_documents_by_pk(
    _set:{
      document: $document
      meta_description: $metaDescription
      title: $title
      is_available: $isAvailable
      text: $text
    },
    pk_columns: {
      cdtn_id: $cdtnId
    }
  ){
    cdtnId:cdtn_id, title, source, metaDescription: meta_description, document, text
  }
}`;

const deleteContentMutation = `
mutation DeleteContent($cdtnId: String!) {
  content: delete_documents_by_pk(cdtn_id: $cdtnId) {
    cdtnId: cdtn_id
  }
}
`;

export function DocumentPage() {
  const router = useRouter();

  const [result] = useQuery({
    query: getDocumentQuery,
    variables: {
      id: router.query.id,
    },
  });
  const { fetching, error, data } = result;

  const [hasChanged, setHasChanged] = useState(false);
  const [submitIdle, setSubmitIdle] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [, executeUpdate] = useMutation(updateDocumentMutation);
  const [, previewContent] = useMutation(previewContentAction);
  const [{ fetching: deleting }, deleteContent] = useMutation(
    deleteContentMutation
  );
  const { handleSubmit } = useForm();

  const jsonDoc = useRef(null);
  if (!fetching && !error && jsonDoc.current === null) {
    jsonDoc.current = data.document;
  }

  function onEditSubmit() {
    setSubmitIdle(true);
    return executeUpdate({
      cdtnId: data.document.cdtnId,
      document: jsonDoc.current.document,
      isAvailable: data.document.is_available,
      metaDescription: jsonDoc.current.meta_description,
      text: jsonDoc.current.text,
      title: jsonDoc.current.title,
    }).then(({ data, error }) => {
      const {
        cdtnId,
        source,
        document,
        metaDescription,
        text,
        title,
      } = data.document;
      if (error) {
        console.error("update impossible", error.message);
      }
      previewContent({
        cdtnId,
        document: {
          ...document,
          metaDescription,
          text,
          title,
        },
        source,
      }).then((response) => {
        if (response.error) {
          console.error("preview impossible", response.error.message);
        }
      });
      setHasChanged(false);
      setSubmitIdle(false);
    });
  }

  function onDelete() {
    deleteContent({ cdtnId: data.document.cdtnId }).then((result) => {
      if (!result.error) {
        router.back();
      }
    });
  }

  function handleEditorChange(stringifyCode) {
    try {
      const newJson = JSON.parse(stringifyCode);
      if (
        JSON.stringify(newJson, 0, 2) !== JSON.stringify(data.document, 0, 2)
      ) {
        jsonDoc.current = newJson;
        setHasChanged(true);
      } else if (stringifyCode === JSON.stringify(data.document, 0, 2)) {
        jsonDoc.current = data.document;
        setHasChanged(false);
      }
    } catch (err) {
      return;
    }
  }

  if (fetching) {
    return "...";
  }

  if (error) {
    return <Message variant="primary">{error.message}</Message>;
  }
  return (
    <Layout title={data.document.title}>
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
      <form onSubmit={handleSubmit(onEditSubmit)}>
        <Stack>
          {data.document.source === SOURCES.SHEET_SP && (
            <Flex
              sx={{
                justifyContent: "flex-end",
              }}
              mb="small"
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
            </Flex>
          )}
          <Card>
            <CodeWithCodemirror
              value={JSON.stringify(jsonDoc.current, 0, 2)}
              onChange={handleEditorChange}
            />
          </Card>
          <Inline>
            <Button disabled={submitIdle || deleting || !hasChanged}>
              Enregistrer
            </Button>
            <Link href="/contenus" passHref>
              <NavLink
                onClick={(e) => {
                  e.preventDefault();
                  router.back();
                }}
              >
                Retour
              </NavLink>
            </Link>
          </Inline>
        </Stack>
      </form>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DocumentPage));
