/** @jsx jsx  */

import Head from "next/head";
import { Layout } from "src/components/layout/auth.layout";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { jsx, Text } from "theme-ui";

export function IndexPage() {
  return (
    <Layout title="Home">
      <Head>
        {/*
          Included so the browser doesn't hit a 404 attempting to GET
          /favicon.ico, which would cause a render of _error.js on the server,
          causing potential confusion
        */}
        <link rel="icon" href="/static/favicon.ico" type="image/x-icon" />
      </Head>
      <Text>Administration des contenus et gestion des alertes</Text>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(IndexPage));
