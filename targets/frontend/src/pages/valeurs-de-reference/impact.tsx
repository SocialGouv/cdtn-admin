import { useRouter } from "next/router";
import { Layout } from "src/components/layout/auth.layout";
import { SmicImpact } from "src/modules/reference-value";
import { Box, Typography } from "@mui/material";

export default function SmicImpactPage() {
  const router = useRouter();

  if (!router.isReady) {
    return (
      <Layout title="Analyse de l'impact">
        <Box />
      </Layout>
    );
  }

  const hourlyValue = parseFloat(router.query.hourlyValue as string);
  const applicationDate = router.query.applicationDate as string;
  const note = (router.query.note as string) || undefined;

  if (isNaN(hourlyValue) || !applicationDate) {
    return (
      <Layout title="Analyse de l'impact">
        <Typography color="error">
          Paramètres invalides. Veuillez retourner à la page précédente.
        </Typography>
      </Layout>
    );
  }

  return (
    <Layout title="Analyse de l'impact">
      <SmicImpact
        hourlyValue={hourlyValue}
        applicationDate={applicationDate}
        note={note}
      />
    </Layout>
  );
}
