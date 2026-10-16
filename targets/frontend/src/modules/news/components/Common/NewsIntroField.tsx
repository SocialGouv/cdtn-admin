import React from "react";
import { TextField } from "@mui/material";
import { Control, Controller } from "react-hook-form";

export const NewsIntroField = ({
  control,
  name,
}: {
  control: Control<any>;
  name: string;
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field: { onChange, value } }) => (
      <TextField
        id={name}
        label="Texte d'introduction (facultatif)"
        value={value ?? ""}
        onChange={onChange}
        size="small"
        fullWidth
      />
    )}
  />
);
