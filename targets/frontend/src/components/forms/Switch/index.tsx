import { FormControlLabel, FormGroup, Switch } from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";
import { CommonFormProps } from "../type";

export type FormSwitchProps = PropsWithChildren<CommonFormProps>;

export const FormSwitch = ({
  name,
  rules,
  label,
  control,
  disabled,
}: FormSwitchProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value } }) => {
        return (
          <FormGroup>
            <FormControlLabel
              control={<Switch onChange={onChange} checked={value} />}
              label={label}
              disabled={disabled}
            />
          </FormGroup>
        );
      }}
    />
  );
};
