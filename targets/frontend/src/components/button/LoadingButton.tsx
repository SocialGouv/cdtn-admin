import React from "react";
import {
  Button,
  ButtonProps,
  CircularProgress as Spinner,
} from "@mui/material";

type Props = {
  loading: boolean;
} & ButtonProps;

export function LoadingButton({
  disabled = false,
  onClick,
  children,
  loading,
  variant = "contained",
  type = "button",
  color = "success",
}: Props) {
  return loading ? (
    <Spinner />
  ) : (
    <Button
      variant={variant}
      type={type}
      color={color}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
