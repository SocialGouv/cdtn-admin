import { Alert, AlertColor, Snackbar } from "@mui/material";
import React from "react";

type Snack = {
  open: boolean;
  severity?: AlertColor;
  message?: string;
};
export const SnackBar = ({
  snack,
  setSnack,
}: {
  snack: Snack;
  setSnack: (s: Snack) => void;
}): JSX.Element => {
  return (
    <Snackbar
      open={snack.open}
      autoHideDuration={20000}
      onClose={(_event, reason) => {
        // Un clic ailleurs (ex. sur le bouton qui affiche le message suivant)
        // ne doit pas refermer le message qui vient d'être posé.
        if (reason === "clickaway") return;
        setSnack({ open: false });
      }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <Alert
        onClose={() => setSnack({ open: false })}
        severity={snack.severity}
      >
        {snack?.message}
      </Alert>
    </Snackbar>
  );
};
export const FixedSnackBar = ({
  children,
  severity = "error",
}: {
  children: JSX.Element | string;
  severity?: AlertColor;
}): JSX.Element => {
  return (
    <Snackbar
      open={true}
      anchorOrigin={{ horizontal: "center", vertical: "top" }}
    >
      <Alert sx={{ minWidth: "800px" }} severity={severity}>
        {children}
      </Alert>
    </Snackbar>
  );
};
