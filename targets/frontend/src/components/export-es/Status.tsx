import { Status as StatusType } from "@shared/types";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";

type StatusProps = {
  status?: StatusType;
  error?: string;
};

export function Status({ status, error }: StatusProps): JSX.Element {
  if (!status) {
    return (
      <Box sx={{ alignItems: "center", display: "flex" }}>
        <CircularProgress size="25px" style={{ marginRight: "1rem" }} />
        <Typography>En cours</Typography>{" "}
      </Box>
    );
  }
  switch (status) {
    case StatusType.completed:
      return (
        <Typography color={fr.colors.decisions.text.default.success.default}>
          Succès
        </Typography>
      );
    case StatusType.timeout:
      return (
        <Typography color={fr.colors.decisions.text.default.warning.default}>
          Timeout
        </Typography>
      );
    case StatusType.running:
      return (
        <Box sx={{ alignItems: "center", display: "flex" }}>
          <CircularProgress size="25px" style={{ marginRight: "1rem" }} />
          <Typography>En cours</Typography>
        </Box>
      );
    case StatusType.failed:
      return (
        <Tooltip title={error ?? "Aucune erreur enregistrée"}>
          <Typography color={fr.colors.decisions.text.default.error.default}>
            Erreur
          </Typography>
        </Tooltip>
      );
    default:
      return <Typography>{status}</Typography>;
  }
}
