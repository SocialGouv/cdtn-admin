import { Status as StatusType } from "@shared/types";
import { MdTimelapse } from "react-icons/md";
import { Box } from "@mui/material";

type StatusProps = {
  status?: StatusType;
};

export function Status({ status }: StatusProps): JSX.Element {
  if (!status) {
    return (
      <Box sx={{ alignItems: "center", display: "flex" }}>
        <span>En cours</span>{" "}
        <MdTimelapse style={{ marginBottom: "-.3rem", marginLeft: ".4rem" }} />
      </Box>
    );
  }
  switch (status) {
    case StatusType.completed:
      return <span color="positive">Succès</span>;
    case StatusType.timeout:
      return <span color="muted">Timeout</span>;
    case StatusType.running:
      return (
        <Box sx={{ alignItems: "center", display: "flex" }}>
          <span>En cours</span>{" "}
          <MdTimelapse
            style={{ marginBottom: "-.2rem", marginLeft: ".3rem" }}
          />
        </Box>
      );
    case StatusType.failed:
      return <span color="critical">Erreur</span>;
    default:
      return <span>{status}</span>;
  }
}
