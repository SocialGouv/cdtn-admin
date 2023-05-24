import { Chip, createFilterOptions } from "@mui/material";
import { useEffect, useState } from "react";
import { Control } from "react-hook-form";

import { FormAutocomplete } from "../../../forms";
import { CdtnDocument, LegiReference } from "../../type";
import { useContributionSearchCdtnDocumentQuery } from "./CdtnDocumentsSearch.query";
import { useContributionSearchLegiReferenceQuery } from "./LegiReferencesSearch.query";

type Props = {
  name: string;
  control: Control<any, any>;
};

export const CdtnDocumentInput = ({ name, control }: Props): JSX.Element => {
  const [query, setQuery] = useState<string | undefined>();
  const { data, fetching, error } = useContributionSearchCdtnDocumentQuery({
    query,
  });

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly CdtnDocument[]>([]);

  useEffect(() => {
    setOptions(data);
  }, [data]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <FormAutocomplete<CdtnDocument>
      control={control}
      getOptionLabel={(item) => `${item.source} > ${item.title}`}
      getOptionValue={(item) => item.cdtn_id}
      multiple
      name={name}
      label={`Contenus liés`}
      options={options}
      filterOptions={createFilterOptions({
        stringify: (option) => option.title,
      })}
      isOptionEqualToValue={(option, value) => value.cdtn_id === option.cdtn_id}
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
                `https://www.legifrance.gouv.fr/codes/article_lc/${option.cdtn_id}/?idConteneur=LEGITEXT000006072050`,
                "_blank",
                "noopener,noreferrer"
              );
              if (newWindow) newWindow.opener = null;
            }}
            color="default"
            variant="outlined"
            label={`${option.source} > ${option.title}`}
            {...getTagProps({ index })}
            key={option.cdtn_id}
          />
        ))
      }
      fullWidth
    />
  );
};
