import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { useSiteSettingsQuery } from "../settings.query";
import { useSaveSiteSettingsMutation } from "../settings.mutation";

const NPS_HELP_ID = "settings-nps-help";

type Feedback = { severity: "success" | "error"; message: string };

export function SettingsPage() {
  const { settings, fetching, error, reexecute } = useSiteSettingsQuery();
  const [{ fetching: saving }, save] = useSaveSiteSettingsMutation();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const onNpsToggle = async (npsEnabled: boolean) => {
    if (!settings) return;
    setFeedback(null);
    const result = await save({ ...settings, npsEnabled });
    if (result.error) {
      setFeedback({
        severity: "error",
        message: "Le paramètre n'a pas pu être enregistré. Veuillez réessayer.",
      });
      return;
    }
    reexecute({ requestPolicy: "network-only" });
    setFeedback({
      severity: "success",
      message: npsEnabled
        ? "Widget NPS activé. Il sera affiché sur le site après la prochaine mise à jour."
        : "Widget NPS désactivé. Il sera masqué sur le site après la prochaine mise à jour.",
    });
  };

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Widget NPS
          </Typography>

          {fetching && !settings && (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress aria-label="Chargement des paramètres" />
            </Box>
          )}

          {error && !settings && (
            <Alert severity="error">
              Erreur lors du chargement des paramètres.
            </Alert>
          )}

          {settings && (
            <FormControlLabel
              control={
                <Switch
                  checked={settings.npsEnabled}
                  disabled={saving}
                  onChange={(event) => onNpsToggle(event.target.checked)}
                  inputProps={{ "aria-describedby": NPS_HELP_ID }}
                />
              }
              label="Afficher le widget NPS sur le site"
            />
          )}

          <Typography
            id={NPS_HELP_ID}
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Activez le widget pendant une campagne de collecte NPS. Désactivé,
            le site n&apos;affiche ni la pop-up de sortie (ordinateur) ni
            l&apos;icône en forme de main (mobile). Le changement est pris en
            compte sur le site après la prochaine{" "}
            <Link component={NextLink} href="/mises-a-jour">
              mise à jour
            </Link>{" "}
            (préproduction, puis production).
          </Typography>

          <Box role="status" aria-live="polite" sx={{ mt: 2 }}>
            {feedback && (
              <Alert severity={feedback.severity}>{feedback.message}</Alert>
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
