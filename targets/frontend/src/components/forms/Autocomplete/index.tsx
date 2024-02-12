import {
  AutocompleteCloseReason,
  AutocompleteFreeSoloValueMapping,
  AutocompleteInputChangeReason,
  FilterOptionsState,
} from "@mui/base/useAutocomplete/useAutocomplete";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  TextField,
} from "@mui/material";
import { AutocompleteRenderGetTagProps } from "@mui/material/Autocomplete/Autocomplete";
import React, { PropsWithChildren } from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";

type AutocompleteFormProps<T, FreeSolo> = PropsWithChildren<
  CommonFormProps & {
    getOptionLabel: (
      option: T | AutocompleteFreeSoloValueMapping<FreeSolo>
    ) => string;
    freeSolo?: FreeSolo;
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
    renderTags?: (
      value: T[],
      getTagProps: AutocompleteRenderGetTagProps
    ) => React.ReactNode;
    filterOptions: (options: T[], state: FilterOptionsState<T>) => T[];
    noOptionsText?: React.ReactNode;
    multiple?: true;
  }
>;

export const FormAutocomplete = <
  T,
  FreeSolo extends boolean | undefined = false
>({
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
  onInputChange,
  renderTags,
  filterOptions,
  noOptionsText,
  disabled,
  multiple,
  freeSolo,
}: AutocompleteFormProps<T, FreeSolo>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl fullWidth={fullWidth} error={!!error}>
          <Autocomplete<T, true, true, FreeSolo>
            clearOnBlur={false}
            forcePopupIcon={false}
            disabled={disabled}
            disableClearable={!!multiple ? true : undefined}
            multiple={multiple}
            freeSolo={freeSolo}
            id={`id-${label}`}
            value={value}
            onChange={(event, value) => onChange(value)}
            open={open}
            onOpen={onOpen}
            onClose={onClose}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={getOptionLabel}
            filterOptions={filterOptions}
            options={options}
            loading={loading}
            onInputChange={onInputChange}
            renderTags={renderTags}
            noOptionsText={noOptionsText}
            renderInput={(params) => (
              <TextField
                {...params}
                id={name}
                error={!!error}
                helperText={error?.message}
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
        </FormControl>
      )}
    />
  );
};
