import { Status as StatusType } from "@shared/types";
import { MdTimelapse } from "react-icons/md";
import { Box, Typography } from "@mui/material";
import { theme } from "src/theme";

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
      return <Typography color={theme.colors.positive}>Succès</Typography>;
    case StatusType.timeout:
      return <Typography color={theme.colors.muted}>Timeout</Typography>;
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
      return <Typography color={theme.colors.critical}>Erreur</Typography>;
    default:
      return <Typography>{status}</Typography>;
  }
}
