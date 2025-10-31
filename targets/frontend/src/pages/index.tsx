import { DuplicateContent } from "src/components/home/DuplicateItems";
import { GhostLinkedDocuments } from "src/components/home/InvisibleLinkedDocument";
import { UnThemedContent } from "src/components/home/UnThemedContent";
import { Layout } from "src/components/layout/auth.layout";
import { Stack, Typography } from "@mui/material";
import MetabaseDashboard from "./MetabaseDashboard";

export default function IndexPage() {
  return (
    <Layout title="Administration des contenus et gestion des alertes">
      <Stack spacing={3} sx={{ width: "100%" }}>
        <Typography variant="h3">Tableau de bord</Typography>

        {/* Ligne 1 : Les 3 petits composants */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          useFlexGap
          flexWrap="wrap"
        >
          <UnThemedContent />
          <DuplicateContent />
          <GhostLinkedDocuments />
        </Stack>

        {/* Ligne 2 : Iframe pleine largeur */}
        <Stack sx={{ width: "100%" }}>
          <MetabaseDashboard dashboardId={8} />
        </Stack>
      </Stack>
    </Layout>
  );
}
