import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { Layout } from "src/components/layout/auth.layout";
import { useMutation, useQuery } from "urql";
import { Card, Stack } from "@mui/material";

import getDocumentQuery from "../../lib/contenus/getDocument.query.graphql";
import updateDocumentMutation from "../../lib/contenus/updateDocument.mutation.graphql";
import { FixedSnackBar } from "../../components/utils/SnackBar";
import CodeEditor from "../../components/editor/CodeEditor";

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
  const [jsonData, setJsonData] = useState<string>("{}");
  const [, executeUpdate] = useMutation(updateDocumentMutation);
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
    if (errorUpdate) {
      console.error("update impossible", errorUpdate.message);
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
    <Layout title={"Edition contenu"} disableHeadTag>
      <form onSubmit={handleSubmit(onEditSubmit)}>
        <Stack>
          <Card>
            <CodeEditor value={jsonData} onChange={handleEditorChange} />
          </Card>

          <Stack direction="row" spacing={2} mt={4} justifyContent="end">
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
            <Button variant="contained" type="submit" disabled={!hasChanged}>
              Enregistrer
            </Button>
          </Stack>
        </Stack>
      </form>
    </Layout>
  );
}

export default DocumentPage;
