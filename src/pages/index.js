/** @jsx jsx  */
import { jsx, Text } from "theme-ui";
import Head from "next/head";

import { withCustomUrqlClient } from "src/components/CustomUrqlClient";
import { withAuthProvider } from "src/hooks/useAuth";
import { Layout } from "src/components/layout/auth.layout";

export function IndexPage() {
  return (
    <Layout>
      <Head>
        <title>Home | Admin cdtn </title>
      </Head>
      <Text>Administration des Contenu est gestion des alertes</Text>
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(IndexPage));
