import { Stack, FormControl } from "@mui/material";
import React from "react";
import { FormRadioGroup, FormTextField } from "src/components/forms";
import { Control } from "react-hook-form";
import { CdtnReferenceInput } from "src/components/contributions/answers/references";

export type InformationBlockContentProps = {
  name: string;
  control: Control<any>;
};

export const InformationsBlockContent = ({
  name,
  control,
}: InformationBlockContentProps): JSX.Element => {
  return (
    <>
      <Stack
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <FormControl>
          <FormTextField
            name={`${name}.content`}
            control={control}
            label="Texte"
            multiline
            fullWidth
            labelFixed
          />
        </FormControl>
        <FormRadioGroup
          name={`${name}.contentDisplayMode`}
          label="Affichage contenus"
          control={control}
          options={[
            {
              label: "Carré",
              value: "square",
            },
            {
              label: "Ligne",
              value: "line",
            },
          ]}
        />
        <CdtnReferenceInput
          name={`${name}.contents`}
          control={control}
        ></CdtnReferenceInput>
      </Stack>
    </>
  );
};
