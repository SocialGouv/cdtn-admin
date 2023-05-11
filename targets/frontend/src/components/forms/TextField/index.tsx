import { TextField } from "@mui/material";
import { TextFieldPropsSizeOverrides } from "@mui/material/TextField/TextField";
import { OverridableStringUnion } from "@mui/types";
import React from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";

type FormTextFieldProps = CommonFormProps & {
  size?: OverridableStringUnion<
    "small" | "medium",
    TextFieldPropsSizeOverrides
  >;
  fullWidth?: boolean;
  multiline?: boolean;
};

export const FormTextField = ({
  name,
  control,
  label,
  rules,
  size,
  fullWidth,
  multiline,
}: FormTextFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          helperText={
            error && error.type === "required" ? "Ce champ est requis" : null
          }
          size={size}
          error={!!error}
          onChange={onChange}
          value={value}
          fullWidth={fullWidth}
          label={label}
          variant="outlined"
          multiline={multiline}
        />
      )}
    />
  );
};
