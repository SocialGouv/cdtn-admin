import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";

type OptionProps = {
  label: string;
  value: string;
};

type SelectFormProps = PropsWithChildren<
  CommonFormProps & {
    options: OptionProps[];
    variant?: "standard" | "outlined" | "filled";
    fullWidth?: boolean;
    autoWidth?: boolean;
  }
>;
export const FormSelect = ({
  name,
  rules,
  label,
  control,
  options,
  variant,
  fullWidth,
  autoWidth,
}: SelectFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl fullWidth={fullWidth} error={!!error}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            labelId={`${name}-label`}
            id={`${name}-select`}
            label={label}
            variant={variant}
            onChange={onChange}
            value={value}
            autoWidth={autoWidth}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && error.type === "required" ? (
            <FormHelperText>Ce champ est requis</FormHelperText>
          ) : null}
        </FormControl>
      )}
    />
  );
};
