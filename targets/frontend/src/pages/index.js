/** @jsx jsx  */
import { GitlabButton } from "src/components/button/GitlabButton";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { jsx, Text } from "theme-ui";

export function IndexPage() {
  return (
    <Layout title="Home">
      <Text>Administration des contenus et gestion des alertes</Text>
      <Inline>
        <GitlabButton env="prod">Mettre à jour la prod</GitlabButton>
        <GitlabButton env="preprod">Mettre à jour la preprod</GitlabButton>
      </Inline>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(IndexPage));
