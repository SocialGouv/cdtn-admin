/** @jsx jsx  */

import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { Layout } from "src/components/layout/auth.layout";
import { withAuthProvider } from "src/lib/auth";
import { jsx, Text } from "theme-ui";

export function IndexPage() {
  return (
    <Layout title="Home">
      <Text>Administration des Contenu est gestion des alertes</Text>
    </Layout>
  );
}

export default withCustomUrqlClient(withAuthProvider(IndexPage));
