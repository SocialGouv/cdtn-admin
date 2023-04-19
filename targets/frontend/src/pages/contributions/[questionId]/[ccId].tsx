/** @jsxImportSource theme-ui */

import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import dynamic from "next/dynamic";
import { useState } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function EditInformationPage() {
  const router = useRouter();
  const questionId = router.query.questionId;
  const ccId = router.query.ccId;
  const [value, setValue] = useState("**Hello world!!!**");

  const onSubmit = () => {
    console.info("Saving");
  };

  return (
    <Layout title={`${ccId} - ${questionId}`}>
      <div>
        <MDEditor value={value} onChange={setValue} />
      </div>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EditInformationPage));
