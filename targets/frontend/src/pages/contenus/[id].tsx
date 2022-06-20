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
import { previewContentAction } from "src/lib/preview/preview.gql";
import { ContentUpdateMutation } from "src/types";
import { Card, Message, NavLink } from "theme-ui";
import { useMutation, useQuery } from "urql";

import getDocumentQuery from "./getDocument.query.graphql";
import updateDocumentMutation from "./updateDocument.mutation.graphql";

const CodeWithCodemirror = dynamic(import("src/components/editor/CodeEditor"), {
  ssr: false,
});

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
  const [, previewContent] = useMutation(previewContentAction);
  const { handleSubmit } = useForm();

  const jsonDoc = useRef(null);
  if (!fetching && !error && jsonDoc.current === null) {
    jsonDoc.current = data.document;
  }

  const current = jsonDoc.current as ContentUpdateMutation | null;

  function onEditSubmit() {
    setSubmitIdle(true);
    return executeUpdate({
      cdtnId: data.document.cdtn_id,
      document: current?.document,
      isAvailable: data.document.is_available,
      metaDescription: current?.meta_description,
      text: current?.text,
      title: current?.title,
    }).then(({ data, error }) => {
      if (!data) {
        console.error("update impossible");
        return;
      }
      const { cdtnId, source, document, metaDescription, text, title } =
        data?.document;
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

  function handleEditorChange(stringifyCode: string) {
    try {
      const newJson = JSON.parse(stringifyCode);
      if (
        JSON.stringify(newJson, undefined, 2) !==
        JSON.stringify(data.document, undefined, 2)
      ) {
        jsonDoc.current = newJson;
        setHasChanged(true);
      } else if (
        stringifyCode === JSON.stringify(data.document, undefined, 2)
      ) {
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
            {/*
              // @ts-ignore */}
            <CodeWithCodemirror
              value={JSON.stringify(jsonDoc.current, undefined, 2)}
              onChange={handleEditorChange}
            />
          </Card>
          <Inline>
            {/*
              // @ts-ignore */}
            <Button disabled={submitIdle || !hasChanged}>Enregistrer</Button>
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
