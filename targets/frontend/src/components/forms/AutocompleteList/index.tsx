import { ReactElement, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import {
  Autocomplete,
  AutocompleteProps,
  CircularProgress,
  TextField,
} from "@mui/material";
import { CommonFormProps } from "../type";
import { CombinedError } from "urql";
import { TitleBox } from "../TitleBox";

export type Result<Type> = {
  data: Type[];
  fetching: boolean;
  error: CombinedError | undefined;
};

type ListAutocompleteProps<T> = Omit<
  AutocompleteProps<
    T,
    boolean | undefined,
    boolean | undefined,
    boolean | undefined
  >,
  "renderInput" | "options" | "onInputChange" | "getOptionLabel"
> &
  CommonFormProps & {
    renderForm: (value: T[]) => ReactElement;
    fetcher: (query: string | undefined, idcc?: string) => Result<T>;
    getOptionLabel: (option: T) => string;
    append: (value: T) => void;
  };

export const AutocompleteList = <T,>({
  label,
  name,
  control,
  rules,
  open,
  onOpen,
  onClose,
  isOptionEqualToValue,
  getOptionLabel,
  loading,
  filterOptions,
  noOptionsText,
  renderForm,
  fetcher,
  append,
}: ListAutocompleteProps<T>) => {
  const [query, setQuery] = useState<string | undefined>();
  const [options, setOptions] = useState<readonly T[]>([]);
  const { data, fetching } = fetcher(query);
  useEffect(() => {
    setOptions(data);
  }, [JSON.stringify(data)]);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { value } }) => (
        <>
          <TitleBox title={`Documents`}>
            {renderForm(value)}
            <Autocomplete<T, false, true, false>
              disableClearable
              loading={fetching}
              options={options}
              clearOnBlur={true}
              forcePopupIcon={false}
              id={`id-${label}`}
              onChange={(_event, newValue) => {
                if (newValue) {
                  append(newValue);
                }
                setQuery("");
              }}
              open={open}
              onOpen={onOpen}
              onClose={onClose}
              isOptionEqualToValue={isOptionEqualToValue}
              getOptionLabel={getOptionLabel}
              filterOptions={filterOptions}
              onInputChange={(_event, autocompleteValue) => {
                setQuery(autocompleteValue);
              }}
              noOptionsText={noOptionsText}
              renderInput={(params) => (
                <TextField
                  {...params}
                  id={name}
                  label={label}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </TitleBox>
        </>
      )}
    />
  );
};
