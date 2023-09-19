import { Stack, FormControl } from "@mui/material";
import React from "react";
import { FormTextField } from "src/components/forms";
import { Control } from "react-hook-form";

export type InformationBlockTextProps = {
  name: string;
  control: Control<any>;
};

export const InformationsBlockText = ({
  name,
  control,
}: InformationBlockTextProps): JSX.Element => {
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
            rules={{ required: true }}
            multiline
            fullWidth
            labelFixed
          />
        </FormControl>
      </Stack>
    </>
  );
};
