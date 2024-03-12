import React, { useState } from "react";
import { SourceRoute, getRouteBySource } from "@socialgouv/cdtn-sources";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { prequalifiedSchema, Prequalified } from "../type";
import { FormAutocomplete, FormTextField } from "../../../components/forms";
import { Button, Chip, Stack, IconButton, FormControl } from "@mui/material";
import { AutocompleteList } from "src/components/forms/AutocompleteList";
import { useContributionSearchCdtnReferencesQuery } from "src/components/contributions/answers/references/cdtnReferencesSearch.query";
import { CdtnReference } from "src/components/contributions";
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

type PrequalifiedFormParams = {
  data?: Prequalified;
  onSubmit: (data: Prequalified) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export const PrequalifiedForm = ({
  data,
  onSubmit,
  onDelete,
}: PrequalifiedFormParams) => {
  const isCreation = !data?.id;
  const [submitting, setSubmitting] = useState(false);
  const prequalifiedFormBaseSchema = prequalifiedSchema.pick({
    documents: true,
    variants: true,
  });
  const {
    control,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<Prequalified>({
    resolver: zodResolver(prequalifiedFormBaseSchema),
    shouldFocusError: true,
    defaultValues: {
      ...(data ?? { variants: [], documents: [] }),
    },
  });
  const { fields, remove, swap, append } = useFieldArray<
    Prequalified,
    "documents"
  >({
    control,
    name: "documents",
  });

  const submit = async () => {
    setSubmitting(true);
    const isValid = await trigger();
    console.log("isValid", isValid);
    if (!isValid) {
      console.log("errors", errors);
      setSubmitting(false);
      return;
    }
    const formData = getValues();
    onSubmit({
      ...data,
      ...formData,
    }).then(() => setSubmitting(false));
    reset({ ...formData });
  };

  return (
    <>
      <Stack spacing={2} padding={2}>
        <FormControl>
          <FormTextField label="Titre" name="title" control={control} />
        </FormControl>
        <FormAutocomplete<string, true>
          name="variants"
          control={control}
          label="Variants"
          multiple
          freeSolo
          options={data?.variants ?? []}
          getOptionLabel={(label) => label}
          filterOptions={(options) => options}
          renderTags={(value: string[], getTagProps) =>
            value.map((option: string, index: number) => (
              <Chip
                label={option}
                variant="outlined"
                {...getTagProps({ index })}
                key={index}
              />
            ))
          }
          fullWidth
        ></FormAutocomplete>
        <AutocompleteList<CdtnReference>
          fetcher={useContributionSearchCdtnReferencesQuery}
          label="Rechercher"
          name="documents"
          control={control}
          append={(value) => {
            if (data?.id) {
              append({
                documentId: value.document.cdtnId,
                order: fields.length,
                ...value,
              });
            }
          }}
          renderForm={() => (
            <>
              {fields.map(({ document }, index) => (
                <Stack
                  key={index}
                  direction="row"
                  justifyContent="space-between"
                >
                  <span>{`${getRouteBySource(
                    document?.source as SourceRoute
                  )} > ${document?.title} (${document?.slug})`}</span>
                  <Stack direction="row" className={index.toString()}>
                    <IconButton
                      aria-label="delete"
                      onClick={() => remove(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <IconButton
                      aria-label="moveTop"
                      disabled={index === 0}
                      onClick={() => swap(index, index - 1)}
                    >
                      <KeyboardArrowUpIcon />
                    </IconButton>
                    <IconButton
                      aria-label="moveDown"
                      disabled={index === fields.length - 1}
                      onClick={() => swap(index, index + 1)}
                    >
                      <KeyboardArrowDownIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              ))}
            </>
          )}
          isOptionEqualToValue={(option, value) =>
            value.document.cdtnId === option.document.cdtnId
          }
          getOptionLabel={(item) =>
            `${getRouteBySource(item.document.source as SourceRoute)} > ${
              item.document.title
            } (${item.document.slug})`
          }
        />
      </Stack>
      {!submitting && (
        <Stack direction="row" justifyContent="end" spacing={2} padding={2}>
          {!isCreation && (
            <Button
              variant="text"
              color="error"
              type="button"
              onClick={() => {
                if (onDelete) onDelete();
              }}
            >
              Supprimer
            </Button>
          )}
          <Button variant="contained" type="button" onClick={() => submit()}>
            {isCreation ? "Créer" : "Sauvegarder"}
          </Button>
        </Stack>
      )}
    </>
  );
};
