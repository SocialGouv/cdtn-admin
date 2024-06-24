import React from "react";
import { Button, CircularProgress as Spinner } from "@mui/material";

type Props = {
  disabled?: boolean;
  isPublishing: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function PublishButton({
  disabled=false,
  onClick,
  children,
  isPublishing,
}: Props) {
  return isPublishing ? (
    <Spinner />
  ) : (
    <Button
      variant="contained"
      type="button"
      color="success"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
