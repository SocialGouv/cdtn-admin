import { GitlabButton } from "src/components/button/GitlabButton";
import { UnThemedContent } from "src/components/home/UnThemedContent";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Heading } from "theme-ui";

export function IndexPage() {
  return (
    <Layout title="Administration des contenus et gestion des alertes">
      <Stack>
        <Inline>
          <GitlabButton env="prod">Mettre à jour la prod</GitlabButton>
          <GitlabButton env="dev">Mettre à jour la preprod</GitlabButton>
        </Inline>
        <Heading as="h2" sx={{ fontSize: "large" }}>
          Tableau de bord
        </Heading>
        <Inline>
          <UnThemedContent />
        </Inline>
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(IndexPage));
