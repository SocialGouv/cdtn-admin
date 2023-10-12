import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  styled,
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
          {error && <StyledTypography>{error.message}</StyledTypography>}
        </FormControl>
      )}
    />
  );
};

const StyledTypography = styled(Typography)(({ theme }) => {
  return {
    color: theme.palette.error.main,
  };
});
