import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormHelperText,
  styled,
} from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";
import { CommonFormProps } from "../type";
import { TitleBox } from "../TitleBox";

type OptionProps = {
  label: string;
  value: string;
  isDisabled?: boolean;
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
          <TitleBox title={label} disabled={disabled}>
            <>
              <RadioGroup
                value={value}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  onChange(event.target.value)
                }
                name={name}
              >
                {options.map(({ label, value, isDisabled }) => (
                  <FormControlLabel
                    key={value}
                    value={value}
                    control={<Radio id={`${name}.${value}`} />}
                    label={label}
                    disabled={isDisabled || disabled}
                    htmlFor={`${name}.${value}`}
                  />
                ))}
              </RadioGroup>
              {error && error.message === "Required" && (
                <StyledFormHelperText>
                  Un élément doit être sélectionner
                </StyledFormHelperText>
              )}
            </>
          </TitleBox>
        </FormControl>
      )}
    />
  );
};

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => {
  return {
    color: theme.palette.error.main,
  };
});
