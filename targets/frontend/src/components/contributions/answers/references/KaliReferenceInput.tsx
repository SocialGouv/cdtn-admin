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
import { Agreement, Answer, KaliArticle } from "../../type";
import { Result } from "./ReferenceInput";
import { SimpleLink } from "../../../utils/SimpleLink";

type KaliReferenceSearchProps = {
  idcc: string;
  disabled?: boolean;
  onAdd: (item: KaliArticle | null) => void;
  fetcher: (idcc: string) => (query: string | undefined) => Result<KaliArticle>;
};

const KaliReferenceSearch = ({
  fetcher,
  idcc,
  disabled,
  onAdd,
}: KaliReferenceSearchProps): React.ReactElement => {
  const [value, setValue] = useState<KaliArticle | null>(null);

  const [query, setQuery] = useState<string | undefined>();
  const { data, fetching } = fetcher(idcc)(query);
  const [options, setOptions] = useState<readonly KaliArticle[]>([]);

  useEffect(() => {
    setOptions(data);
  }, [JSON.stringify(data)]);

  return (
    <Autocomplete
      disabled={disabled}
      onChange={(event: any, newValue: KaliArticle | null) => {
        onAdd(newValue);
        setValue(null);
        setQuery("");
      }}
      value={value}
      onInputChange={(event, newValue) => {
        setQuery(newValue);
      }}
      options={options}
      filterOptions={(options) => options}
      loading={fetching}
      getOptionLabel={(item: KaliArticle) => {
        return item.path;
      }}
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
  agreement: Agreement;
  control: Control<any>;
  disabled?: boolean;
};

export const KaliReferenceInput = ({
  name,
  agreement,
  control,
  disabled = false,
}: Props): ReactElement | null => {
  const { fields, append, remove } = useFieldArray<Answer, "kaliReferences">({
    control,
    name: "kaliReferences",
  });

  return (
    <TitleBox
      title={`Références liées à la convention collective ${agreement.id}`}
      disabled={disabled}
    >
      <Stack spacing={2} mt={4}>
        {fields.map((field, index) => {
          const ref = fields[index];

          return (
            <Grid container key={field.id}>
              <Grid item xs={2} mr={2}>
                <FormTextField
                  name={`${name}.${index}.label`}
                  label="Libellé"
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
                  href={`https://www.legifrance.gouv.fr/conv_coll/id/${ref.kaliArticle.id}/?idConteneur=${agreement.kaliId}`}
                >
                  {ref.kaliArticle.path}
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
        {!disabled && agreement.id && (
          <KaliReferenceSearch
            fetcher={useContributionSearchKaliReferenceQuery}
            idcc={agreement.id}
            onAdd={(value) => {
              if (value) {
                append({ kaliArticle: value, label: "" });
              }
            }}
          />
        )}
      </Stack>
    </TitleBox>
  );
};
