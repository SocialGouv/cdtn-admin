import { Chip, createFilterOptions } from "@mui/material";
import { useEffect, useState } from "react";
import { Control } from "react-hook-form";

import { FormAutocomplete } from "../../../forms";
import { LegiReference } from "../../type";
import { useContributionSearchLegiReferenceQuery } from "./LegiReferencesSearch.query";

type Props = {
  name: string;
  control: Control<any, any>;
};

export const LegiReferenceInput = ({ name, control }: Props): JSX.Element => {
  const [query, setQuery] = useState<string | undefined>();
  const { data, fetching, error } = useContributionSearchLegiReferenceQuery({
    query,
  });

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly LegiReference[]>([]);

  useEffect(() => {
    setOptions(data);
  }, [data]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <FormAutocomplete<LegiReference>
      control={control}
      getOptionLabel={(item) => item.index}
      getOptionValue={(item) => item.id}
      multiple
      name={name}
      label={`Références liées au code du travail`}
      options={options}
      filterOptions={createFilterOptions({
        stringify: (option) => option.index,
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
                `https://www.legifrance.gouv.fr/codes/article_lc/${option.id}/?idConteneur=LEGITEXT000006072050`,
                "_blank",
                "noopener,noreferrer"
              );
              if (newWindow) newWindow.opener = null;
            }}
            color="success"
            variant="outlined"
            label={option.index}
            {...getTagProps({ index })}
            key={option.id}
          />
        ))
      }
      fullWidth
    />
  );
};
