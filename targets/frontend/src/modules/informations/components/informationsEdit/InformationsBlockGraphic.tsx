import { Stack, FormControl } from "@mui/material";
import React from "react";
import { FormEditionField, FormTextField } from "src/components/forms";
import { Control } from "react-hook-form";

export type InformationBlockGraphicProps = {
  name: string;
  control: Control<any>;
};

export const InformationsBlockGraphic = ({
  name,
  control,
}: InformationBlockGraphicProps): JSX.Element => {
  return (
    <>
      <Stack
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <FormControl>
          <FormEditionField
            label="Texte"
            name={`${name}.content`}
            control={control}
            rules={{ required: true }}
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name={`${name}.img.url`}
            control={control}
            label="Url Image"
            rules={{ required: true }}
            fullWidth
            labelFixed
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name={`${name}.file.url`}
            control={control}
            label="Url Fichier"
            rules={{ required: true }}
            fullWidth
            labelFixed
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name={`${name}.file.altText`}
            control={control}
            label="Texte Alt"
            rules={{ required: true }}
            fullWidth
            labelFixed
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name={`${name}.file.size`}
            control={control}
            label="Taille"
            rules={{ required: true }}
            fullWidth
            labelFixed
          />
        </FormControl>
      </Stack>
    </>
  );
};
