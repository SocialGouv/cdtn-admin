import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";
import { CommonFormProps } from "../type";

type OptionProps = {
  label: string;
  value: string;
};

export type RadioGroupProps = PropsWithChildren<
  CommonFormProps & {
    fullWidth?: boolean;
    options: OptionProps[];
  }
>;
export const FormRadioGroup = ({
  name,
  rules,
  label,
  control,
  fullWidth,
  options,
  disabled,
}: RadioGroupProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl fullWidth={fullWidth} error={!!error}>
          <FormLabel>{label}</FormLabel>

          <RadioGroup
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.value)
            }
          >
            {options.map(({ label, value }) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio />}
                label={label}
                disabled={disabled}
              />
            ))}
          </RadioGroup>
        </FormControl>
      )}
    />
  );
};
