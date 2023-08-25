import { DuplicateContent } from "src/components/home/DuplicateItems";
import { GhostLinkedDocuments } from "src/components/home/InvisibleLinkedDocument";
import { UnThemedContent } from "src/components/home/UnThemedContent";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Box, Typography } from "@mui/material";

export function IndexPage() {
  return (
    <Layout title="Administration des contenus et gestion des alertes">
      <Stack>
        <Typography variant="h3">Tableau de bord</Typography>
        <Box sx={{ flexWrap: "wrap", gap: "2rem", display: "flex" }}>
          <UnThemedContent />
          <DuplicateContent />
          <GhostLinkedDocuments />
        </Box>
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(IndexPage));
