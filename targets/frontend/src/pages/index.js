import { DuplicateContent } from "src/components/home/DuplicateItems";
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
        <Heading as="h2" sx={{ fontSize: "large" }}>
          Tableau de bord
        </Heading>
        <Inline>
          <UnThemedContent />
          <DuplicateContent />
        </Inline>
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(IndexPage));
