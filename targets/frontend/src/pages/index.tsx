import { DuplicateContent } from "src/components/home/DuplicateItems";
import { GhostLinkedDocuments } from "src/components/home/InvisibleLinkedDocument";
import { UnThemedContent } from "src/components/home/UnThemedContent";
import { Layout } from "src/components/layout/auth.layout";
import { Stack, Typography } from "@mui/material";

export function IndexPage() {
  return (
    <Layout title="Administration des contenus et gestion des alertes">
      <Stack spacing={2}>
        <Typography variant="h3">Tableau de bord</Typography>
        <Stack direction="row" spacing={2}>
          <UnThemedContent />
          <DuplicateContent />
          <GhostLinkedDocuments />
        </Stack>
      </Stack>
    </Layout>
  );
}

export default IndexPage;
