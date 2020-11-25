/** @jsx jsx  */
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { request } from "src/lib/request";
import { Card, jsx, Message, NavLink } from "theme-ui";
import { useMutation, useQuery } from "urql";

const CodeWithCodemirror = dynamic(import("src/components/editor/CodeEditor"), {
  ssr: false,
});

const getDocumentQuery = `
query getDocumentById($id: String!) {
  document: documents_by_pk(cdtn_id: $id){
    cdtn_id,
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
mutation updateDocument($cdtnId: String!, $metaDescription: String!, $title: String!, $isAvailable: Boolean!, $document: jsonb!){
  document: update_documents_by_pk(
    _set:{
      document: $document
      meta_description: $metaDescription
      title: $title
      is_available: $isAvailable
    },
    pk_columns: {
      cdtn_id: $cdtnId
    }
  ){
    cdtnId:cdtn_id, title, source, metaDescription: meta_description, document
  }
}`;

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
  const [, executeUpdate] = useMutation(updateDocumentMutation);
  const { handleSubmit } = useForm();

  const jsonDoc = useRef(null);
  if (!fetching && !error && jsonDoc.current === null) {
    jsonDoc.current = data.document;
  }

  function onEditSubmit() {
    setSubmitIdle(true);
    return executeUpdate({
      cdtnId: data.document.cdtn_id,
      document: jsonDoc.current.document,
      isAvailable: data.document.is_available,
      metaDescription: jsonDoc.current.meta_description,
      title: jsonDoc.current.title,
    }).then(({ data }) => {
      const {
        cdtnId,
        title,
        source,
        metaDescription,
        document,
      } = data.document;
      request("/api/elasticcloud/preview", {
        body: {
          cdtnId,
          document: { ...document, metaDescription, title },
          source,
        },
      });
      if (result.error) {
        console.error(result.error);
      }
      setHasChanged(false);
      setSubmitIdle(false);
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
      <form onSubmit={handleSubmit(onEditSubmit)}>
        <Stack>
          <Card>
            <CodeWithCodemirror
              value={JSON.stringify(jsonDoc.current, 0, 2)}
              onChange={handleEditorChange}
            />
          </Card>
          <Inline>
            <Button disabled={submitIdle || !hasChanged}>Enregistrer</Button>
            <Link href="/contenus" passHref>
              <NavLink>Retour</NavLink>
            </Link>
          </Inline>
        </Stack>
      </form>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DocumentPage));
