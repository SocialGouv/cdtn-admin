import React, { ReactElement, useEffect, useState } from "react";
import { Control, useFieldArray } from "react-hook-form";
import { TitleBox } from "../../../forms/TitleBox";
import {
  Autocomplete,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { FormTextField } from "../../../forms";
import DeleteIcon from "@mui/icons-material/Delete";
import { useContributionSearchKaliReferenceQuery } from "./kaliReferencesSearch.query";
import { KaliReference } from "../../type";
import { Result } from "./ReferenceInput";
import { SimpleLink } from "../../../utils/SimpleLink";

type KaliReferenceSearchProps = {
  idcc: string;
  disabled?: boolean;
  onAdd: (item: KaliReference | null) => void;
  fetcher: (
    idcc: string
  ) => (query: string | undefined) => Result<KaliReference>;
};

const KaliReferenceSearch = ({
  fetcher,
  idcc,
  disabled,
  onAdd,
}: KaliReferenceSearchProps): React.ReactElement => {
  const [value, setValue] = useState<KaliReference | null>(null);

  const [query, setQuery] = useState<string | undefined>();
  const { data, fetching, error } = fetcher(idcc)(query);
  const [options, setOptions] = useState<readonly KaliReference[]>([]);

  useEffect(() => {
    setOptions(data);
  }, [data]);

  return (
    <Autocomplete
      disabled={disabled}
      onChange={(event: any, newValue: KaliReference | null) => {
        onAdd(newValue);
        setValue(null);
        setQuery("");
      }}
      value={value}
      onInputChange={(event, newValue) => {
        setQuery(newValue);
      }}
      options={options}
      loading={fetching}
      getOptionLabel={(item) => item.path}
      renderInput={(params) => (
        <TextField
          {...params}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {fetching ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
          label="Nouvelle Référence"
        />
      )}
    />
  );
};

type Props = {
  name: string;
  idcc: string;
  control: Control<any>;
  disabled?: boolean;
};

export const KaliReferenceInput = ({
  name,
  idcc,
  control,
  disabled = false,
}: Props): ReactElement | null => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <TitleBox
      title={`Références liées à la convention collective ${idcc}`}
      disabled={disabled}
    >
      <Stack spacing={2} mt={4}>
        {fields.map((field, index) => {
          const ref = fields[index] as KaliReference;
          return (
            <Grid container key={field.id}>
              <Grid item xs={2} mr={2}>
                <FormTextField
                  name={`${name}.${index}.label`}
                  label="Label"
                  control={control}
                  rules={{ required: true }}
                  size="small"
                  disabled={disabled}
                  fullWidth
                />
              </Grid>
              <Grid item xs={7}>
                <SimpleLink
                  target="_blank"
                  href={`https://www.legifrance.gouv.fr/conv_coll/id/${ref.cid}/?idConteneur=KALICONT000005635550`}
                >
                  {ref.path}
                </SimpleLink>
              </Grid>
              <Grid item xs={2}>
                {!disabled && (
                  <IconButton aria-label="delete" onClick={() => remove(index)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          );
        })}
        {!disabled && (
          <KaliReferenceSearch
            fetcher={useContributionSearchKaliReferenceQuery}
            idcc={idcc}
            onAdd={append}
          />
        )}
      </Stack>
    </TitleBox>
  );
};
