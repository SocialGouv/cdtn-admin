import { FormControl, Stack } from "@mui/material";
import React from "react";
import { FormEditionField } from "src/components/forms";
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
          <FormEditionField
            label="Texte"
            name={`${name}.content`}
            control={control}
            rules={{ required: true }}
          />
        </FormControl>
      </Stack>
    </>
  );
};
