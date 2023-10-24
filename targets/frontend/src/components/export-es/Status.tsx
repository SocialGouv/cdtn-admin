import { Status as StatusType } from "@shared/types";
import { MdTimelapse } from "react-icons/md";
import { Box, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";

type StatusProps = {
  status?: StatusType;
};

export function Status({ status }: StatusProps): JSX.Element {
  if (!status) {
    return (
      <Box sx={{ alignItems: "center", display: "flex" }}>
        <Typography>En cours</Typography>{" "}
        <MdTimelapse style={{ marginBottom: "-.3rem", marginLeft: ".4rem" }} />
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
          <Typography>En cours</Typography>{" "}
          <MdTimelapse
            style={{ marginBottom: "-.2rem", marginLeft: ".3rem" }}
          />
        </Box>
      );
    case StatusType.failed:
      return (
        <Typography color={fr.colors.decisions.text.default.error.default}>
          Erreur
        </Typography>
      );
    default:
      return <Typography>{status}</Typography>;
  }
}
