import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  FormHelperText,
  styled,
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
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        return (
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
            {error && error.message === "Required" ? (
              <StyledFormHelperText>
                Un élément doit être sélectionner
              </StyledFormHelperText>
            ) : null}
          </FormControl>
        );
      }}
    />
  );
};

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => {
  return {
    color: theme.palette.error.main,
  };
});
