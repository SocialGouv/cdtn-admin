import { useFormContext } from "react-hook-form";

import { ContentPicker } from "../forms/ContentPicker";
import { FormRadioGroup, FormTextField } from "../forms";
import React from "react";
import Box from "@mui/material/Box";

export type SectionContentProps = {
  name: string;
};

export const SectionContent = ({ name }: SectionContentProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  return (
    <>
      <Box
        sx={{
          mb: "2rem",
          mt: "2rem",
        }}
      >
        <FormTextField
          name={`${name}.title`}
          fullWidth
          multiline
          label="Titre"
          control={control}
          rules={{ required: true }}
        />
      </Box>
      <Box mb="small">
        <FormRadioGroup
          name={`${name}.blockDisplayMode`}
          label="Affichage des tuiles"
          control={control}
          options={[
            {
              label: "Ligne",
              value: "line",
            },
            {
              label: "Carré",
              value: "square",
            },
          ]}
        />
      </Box>
      <Box
        sx={{
          flexDirection: "column",
          mt: "small",
        }}
      >
        <ContentPicker
          defaultValue={[]}
          disabled={false}
          control={control}
          errors={errors}
          register={register}
          name={`${name}.contents`}
          id="contents"
        />
      </Box>
    </>
  );
};
