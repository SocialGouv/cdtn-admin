import { Chip } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";
import { Control } from "react-hook-form";

import { FormAutocompleteMultiple } from "../../../forms";
import { CombinedError } from "urql";

export type Result<Type> = {
  data: Type[];
  fetching: boolean;
  error: CombinedError | undefined;
};

type Props<Type> = {
  label: string;
  name: string;
  control: Control<any>;
  fetcher: (query: string | undefined) => Result<Type>;
  isEqual: (value: Type, option: Type) => boolean;
  getLabel: (option: Type) => string;
  onClick: (value: Type) => void;
  color:
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning";
};

export const ReferenceInput = <Type,>({
  name,
  control,
  fetcher,
  label,
  isEqual,
  getLabel,
  onClick,
  color,
}: Props<Type>): ReactElement | null => {
  const [query, setQuery] = useState<string | undefined>();
  const { data, fetching, error } = fetcher(query);

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly Type[]>([]);

  useEffect(() => {
    setOptions(data);
  }, [data]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <FormAutocompleteMultiple<Type>
      noOptionsText={"Aucun résultat trouvé"}
      control={control}
      getOptionLabel={getLabel}
      name={name}
      label={label}
      options={options}
      filterOptions={(options) => options}
      isOptionEqualToValue={isEqual}
      loading={fetching}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      onInputChange={(_, newValue) => {
        setQuery(newValue);
      }}
      renderTags={(value, getTagProps) =>
        value.map((item, index: number) => (
          <Chip
            sx={{
              "& .MuiChip-label": {
                display: "block",
                whiteSpace: "normal",
              },
              height: "auto",
            }}
            onClick={() => onClick(item)}
            color={color}
            variant="outlined"
            label={getLabel(item)}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
      fullWidth
    />
  );
};
