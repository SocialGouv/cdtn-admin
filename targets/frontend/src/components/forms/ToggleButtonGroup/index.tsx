import {
  FormControl,
  FormHelperText,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";
import { CommonFormProps } from "../type";
import { TitleBox } from "src/components/forms/TitleBox";
import { styled } from "@mui/system";

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
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <FormControl fullWidth={fullWidth} error={!!error}>
            <TitleBox title={label} disabled={disabled} isError={!!error}>
              <ToggleButtonGroup
                color={!!error ? "error" : "primary"}
                exclusive
                value={value}
                disabled={disabled}
                onChange={(
                  event: React.MouseEvent<HTMLElement>,
                  toggleValue: string
                ) => {
                  (event.target as any).value = toggleValue;
                  onChange(event);
                }}
              >
                {options.map(({ label: toggleLabel, value: toggleValue }) => (
                  <ToggleButton
                    key={`${toggleLabel}-${toggleValue}`}
                    value={toggleValue}
                    aria-label={`${toggleLabel}-${toggleValue}`}
                  >
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </TitleBox>
          </FormControl>
          {error && (
            <StyledFormHelperText>{error.message}</StyledFormHelperText>
          )}
        </>
      )}
    />
  );
};

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => {
  return {
    color: theme.palette.error.main,
  };
});
