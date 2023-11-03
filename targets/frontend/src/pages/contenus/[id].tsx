import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { previewContentAction } from "src/lib/preview/preview.gql";
import { useMutation, useQuery } from "urql";
import { Card } from "@mui/material";

import getDocumentQuery from "./getDocument.query.graphql";
import updateDocumentMutation from "./updateDocument.mutation.graphql";
import { FixedSnackBar } from "../../components/utils/SnackBar";
import CodeWithCodemirror from "../../components/editor/CodeEditor";

export function DocumentPage() {
  const router = useRouter();

  const [result] = useQuery({
    query: getDocumentQuery,
    variables: {
      id: router.query.id,
    },
  });

  const { fetching, error } = result;

  const [hasBeenInitialized, setHasBeenInitialized] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [jsonData, setJsonData] = useState<any>(null);
  const [, executeUpdate] = useMutation(updateDocumentMutation);
  const [, previewContent] = useMutation(previewContentAction);
  const { handleSubmit } = useForm();

  useEffect(() => {
    if (!hasBeenInitialized && result && result.data && result.data.document) {
      setJsonData(JSON.stringify(result.data.document, undefined, 2));
      setHasBeenInitialized(true);
    }
  }, [JSON.stringify(result)]);

  async function onEditSubmit() {
    const current = JSON.parse(jsonData);
    const { data, error: errorUpdate }: any = await executeUpdate({
      cdtnId: router.query.id,
      document: current.document,
      isAvailable: current.is_available,
      metaDescription: current?.meta_description,
      text: current?.text,
      title: current?.title,
    });
    setHasChanged(false);
    if (!data) {
      console.error("update impossible");
      return;
    }
    const { cdtnId, source, document, metaDescription, text, title } =
      data?.document;
    if (errorUpdate) {
      console.error("update impossible", errorUpdate.message);
    }
    const response: any = previewContent({
      cdtnId,
      document: {
        ...document,
        metaDescription,
        text,
        title,
      },
      source,
    });
    if (response.error) {
      console.error("preview impossible", response.error.message);
    }
  }

  function handleEditorChange(stringifyCode: string) {
    setJsonData(stringifyCode);
    setHasChanged(true);
  }

  if (fetching) {
    return "...";
  }

  if (error) {
    return (
      <FixedSnackBar>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </FixedSnackBar>
    );
  }
  return (
    <Layout title={"Edition contenu"}>
      <form onSubmit={handleSubmit(onEditSubmit)}>
        <Stack>
          <Card>
            <CodeWithCodemirror
              value={jsonData}
              onChange={handleEditorChange}
            />
          </Card>
          <Inline>
            <Button type="submit" disabled={!hasChanged}>
              Enregistrer
            </Button>
            <Link
              href="/contenus"
              passHref
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              style={{ textDecoration: "none" }}
            >
              Retour
            </Link>
          </Inline>
        </Stack>
      </form>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(DocumentPage));
