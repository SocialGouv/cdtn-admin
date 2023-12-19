import { Status as StatusType } from "@shared/types";
import {
  Box,
  CircularProgress,
  Popover,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

type StatusProps = {
  status?: StatusType;
  error?: string;
};

export function Status({ status, error }: StatusProps): JSX.Element {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const errorDisplayed =
    error ?? "Aucune  information sur l'erreur n'a été enregistrée";

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
        <>
          <Button
            aria-describedby={id}
            variant="outlined"
            onClick={handleClick}
            color="error"
          >
            Erreur
          </Button>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ p: 2 }}>
              {errorDisplayed}{" "}
              <IconButton
                aria-label="close"
                onClick={() => {
                  navigator.clipboard.writeText(errorDisplayed);
                  handleClose();
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Typography>
          </Popover>
        </>
      );
    default:
      return <Typography>{status}</Typography>;
  }
}
