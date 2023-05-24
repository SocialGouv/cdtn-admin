import { Chip, createFilterOptions } from "@mui/material";
import { useEffect, useState } from "react";
import { Control } from "react-hook-form";

import { FormAutocomplete } from "../../../forms";
import { KaliReference } from "../../type";
import { useContributionSearchKaliReferenceQuery } from "./KaliReferencesSearch.query";

type Props = {
  name: string;
  idcc: string;
  control: Control<any, any>;
};

export const KaliReferenceInput = ({
  name,
  idcc,
  control,
}: Props): JSX.Element => {
  const [query, setQuery] = useState<string | undefined>();
  const { data, fetching, error } = useContributionSearchKaliReferenceQuery({
    idcc,
    query,
  });

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly KaliReference[]>([]);

  useEffect(() => {
    setOptions(data);
  }, [data]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <FormAutocomplete<KaliReference>
      control={control}
      getOptionLabel={(item) => item.path}
      getOptionValue={(item) => item.id}
      multiple
      name={name}
      label={`Références liées à la convention collective ${idcc}`}
      options={options}
      filterOptions={createFilterOptions({
        stringify: (option) => option.path,
      })}
      isOptionEqualToValue={(option, value) => value.id === option.id}
      disableClearable
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
        value.map((option, index: number) => (
          <Chip
            sx={{
              "& .MuiChip-label": {
                display: "block",
                whiteSpace: "normal",
              },
              height: "auto",
            }}
            onClick={() => {
              const newWindow = window.open(
                `https://www.legifrance.gouv.fr/conv_coll/id/${option.id}/?idConteneur=KALICONT000005635550`,
                "_blank",
                "noopener,noreferrer"
              );
              if (newWindow) newWindow.opener = null;
            }}
            color="secondary"
            variant="outlined"
            label={option.path}
            {...getTagProps({ index })}
            key={option.id}
          />
        ))
      }
      fullWidth
    />
  );
};
