import { AutocompleteCloseReason } from "@mui/base/useAutocomplete/useAutocomplete";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
} from "@mui/material";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";

type OptionProps = {
  label: string;
  value: string;
};

type AutocompleteFormProps = PropsWithChildren<
  CommonFormProps & {
    open?: boolean;
    onOpen?: (event: React.SyntheticEvent) => void;
    onClose?: (
      event: React.SyntheticEvent,
      reason: AutocompleteCloseReason
    ) => void;
    isOptionEqualToValue?: (option: OptionProps, value: OptionProps) => boolean;
    getOptionLabel?: (option: OptionProps) => string;
    options: ReadonlyArray<OptionProps>;
    loading?: boolean;
    variant?: "standard" | "outlined" | "filled";
    fullWidth?: boolean;
  }
>;
export const FormAutocomplete = ({
  name,
  rules,
  label,
  control,
  options,
  open,
  onOpen,
  onClose,
  isOptionEqualToValue,
  getOptionLabel,
  fullWidth,
  loading,
}: AutocompleteFormProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl fullWidth={fullWidth} error={!!error}>
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Autocomplete<OptionProps>
            id="asynchronous-demo"
            value={value}
            onChange={onChange}
            open={open}
            onOpen={onOpen}
            onClose={onClose}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={(option) =>
              getOptionLabel ? getOptionLabel(option) : option.label
            }
            options={options}
            loading={loading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Asynchronous"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
          {error && error.type === "required" ? (
            <FormHelperText>Ce champ est requis</FormHelperText>
          ) : null}
        </FormControl>
      )}
    />
  );
};
