import {
  FormControl,
  FormHelperText,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";
import { CommonFormProps } from "../type";
import { TitleBox } from "src/components/forms/TitleBox";

type OptionProps = {
  label: string;
  value: string;
};

export type ToggleButtonGroupProps = PropsWithChildren<
  CommonFormProps & {
    fullWidth?: boolean;
    options: OptionProps[];
  }
>;
export const FormToggleButtonGroup = ({
  name,
  rules,
  label,
  control,
  fullWidth,
  options,
  disabled,
}: ToggleButtonGroupProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState }) => (
        <FormControl fullWidth={fullWidth} error={!!fieldState.error}>
          <TitleBox title={label} disabled={disabled}>
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={value}
              disabled={disabled}
              onChange={(
                event: React.MouseEvent<HTMLElement>,
                value: string
              ) => {
                (event.target as any).value = value;
                onChange(event);
              }}
            >
              {options.map(({ label, value }) => (
                <ToggleButton
                  key={`${label}-${value}`}
                  value={value}
                  aria-label={`${label}-${value}`}
                >
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </TitleBox>
          {fieldState.error && fieldState.error.type === "required" ? (
            <FormHelperText>Ce champ est requis</FormHelperText>
          ) : null}
        </FormControl>
      )}
    />
  );
};
