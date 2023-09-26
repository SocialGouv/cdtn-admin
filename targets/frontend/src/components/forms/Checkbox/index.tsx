import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";
import { CommonFormProps } from "../type";

export type FormCheckboxProps = PropsWithChildren<CommonFormProps>;
export const FormCheckbox = ({
  name,
  rules,
  label,
  control,
  disabled,
}: FormCheckboxProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => {
        if (value === undefined) {
          return <></>;
        }
        return (
          <FormGroup>
            <FormControlLabel
              control={<Checkbox onChange={onChange} checked={value} />}
              label={label}
              disabled={disabled}
            />
          </FormGroup>
        );
      }}
    />
  );
};
