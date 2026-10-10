import React, { useState } from "react";
import { Control, useFieldArray } from "react-hook-form";
import {
  Autocomplete,
  Chip,
  FormHelperText,
  Stack,
  TextField,
} from "@mui/material";
import { TitleBox } from "src/components/forms/TitleBox";
import { useContributionSearchLegiReferenceQuery } from "src/components/forms/LegiReferences/legiReferencesSearch.query";
import { LegiReference } from "src/components/forms/LegiReferences/type";
import { NewsSortableList } from "./NewsSortableList";

export const NewsLegiReferences = ({ control }: { control: Control<any> }) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "legiReferences",
  });
  const references = fields as unknown as (LegiReference & { id: string })[];
  const [query, setQuery] = useState("");
  const [searchKey, setSearchKey] = useState(0);
  const [duplicate, setDuplicate] = useState(false);
  const { data: options } = useContributionSearchLegiReferenceQuery(query);

  return (
    <TitleBox title="Références liées au code du travail">
      <Stack spacing={2} mt={1}>
        <NewsSortableList
          items={references}
          onMove={move}
          onRemove={remove}
          itemLabel={(reference) => reference.legiArticle.label}
          renderItem={(reference) => (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Chip label="Légifrance" color="success" variant="outlined" />
              <span>{reference.legiArticle.label}</span>
            </Stack>
          )}
        />
        <Autocomplete<Pick<LegiReference, "legiArticle">, false, true, false>
          key={searchKey}
          disableClearable
          options={options}
          inputValue={query}
          onInputChange={(_event, value, reason) => {
            if (reason !== "reset") setQuery(value);
          }}
          getOptionLabel={(o) => o.legiArticle.label}
          filterOptions={(o) => o}
          isOptionEqualToValue={(option, value) =>
            option.legiArticle.id === value.legiArticle.id
          }
          onChange={(_event, value) => {
            const alreadyAdded = references.some(
              (reference) => reference.legiArticle.id === value.legiArticle.id
            );
            setDuplicate(alreadyAdded);
            if (!alreadyAdded) {
              append({ legiArticle: value.legiArticle });
            }
            setQuery("");
            setSearchKey((key) => key + 1);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ajouter un article du code du travail"
              placeholder="Rechercher un article, ex. L1234-9"
            />
          )}
        />
        {duplicate && (
          <FormHelperText error>Cet article est déjà ajouté</FormHelperText>
        )}
      </Stack>
    </TitleBox>
  );
};
