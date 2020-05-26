/** @jsx jsx  */
import Head from "next/head";
import { withCustomUrqlClient } from "src/components/CustomUrqlClient";
import { Layout } from "src/components/layout/auth.layout";
import { withAuthProvider } from "src/lib/auth";
import { jsx, Text } from "theme-ui";

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
