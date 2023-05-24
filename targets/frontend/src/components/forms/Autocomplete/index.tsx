import {
  AutocompleteCloseReason,
  AutocompleteInputChangeReason,
  FilterOptionsState,
} from "@mui/base/useAutocomplete/useAutocomplete";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { AutocompleteRenderGetTagProps } from "@mui/material/Autocomplete/Autocomplete";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";

type AutocompleteFormProps<T> = PropsWithChildren<
  CommonFormProps & {
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => string;
    options: ReadonlyArray<T>;
    onInputChange?: (
      event: React.SyntheticEvent,
      value: string,
      reason: AutocompleteInputChangeReason
    ) => void;
    open?: boolean;
    onOpen?: (event: React.SyntheticEvent) => void;
    onClose?: (
      event: React.SyntheticEvent,
      reason: AutocompleteCloseReason
    ) => void;
    isOptionEqualToValue?: (option: T, value: T) => boolean;
    loading?: boolean;
    fullWidth?: boolean;
    multiple?: boolean;
    disableClearable?: boolean;
    renderTags?: (
      value: T[],
      getTagProps: AutocompleteRenderGetTagProps
    ) => React.ReactNode;
    filterOptions: (options: T[], state: FilterOptionsState<T>) => T[];
  }
>;

export const FormAutocomplete = <T,>({
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
  getOptionValue,
  fullWidth,
  loading,
  onInputChange,
  multiple,
  renderTags,
  filterOptions,
  disableClearable,
}: AutocompleteFormProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl fullWidth={fullWidth} error={!!error}>
          <Autocomplete
            id={`id-${label}`}
            value={value}
            onChange={(event, value) => {
              onChange(
                Array.isArray(value)
                  ? value.map((i) => getOptionValue(i))
                  : value
                  ? getOptionValue(value)
                  : null
              );
            }}
            open={open}
            onOpen={onOpen}
            onClose={onClose}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={getOptionLabel}
            filterOptions={filterOptions}
            disableClearable={disableClearable}
            options={options}
            loading={loading}
            multiple={multiple}
            onInputChange={onInputChange}
            renderTags={renderTags}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
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
