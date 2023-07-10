import { useFormContext } from "react-hook-form";
import { Box, Stack, TextField as Field } from "@mui/material";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { SectionText } from "./SectionText";
import React from "react";

export type SectionImageProps = {
  name: string;
};

export const SectionImage = ({ name }: SectionImageProps) => {
  const {
    register,
    getValues,
    formState: { errors },
  } = useFormContext();
  return (
    <Box
      sx={{
        mb: "1rem",
        mt: "1rem",
      }}
    >
      <Stack spacing={2}>
        <div>
          <Field
            fullWidth
            label="Lien de l’image"
            {...register(`${name}.imgUrl`, {
              validate: {
                required: (value) => {
                  const typeValue = getValues(`${name}.type`);
                  if (!value && typeValue !== "graphic") {
                    return "L’url de l’image est requise";
                  }
                  return true;
                },
              },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="imgUrl" />
        </div>
        <div>
          <Field
            fullWidth
            label="Brève description de l’image"
            {...register(`${name}.altText`, {
              validate: {
                required: (value) => {
                  const typeValue = getValues(`${name}.type`);
                  if (!value && typeValue !== "graphic") {
                    return "La brève description de l’image est requise";
                  }
                  return true;
                },
              },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="altText" />
        </div>
        <div>
          <Field
            label="Lien du pdf"
            fullWidth
            {...register(`${name}.fileUrl`, {
              validate: {
                required: (value) => {
                  const typeValue = getValues(`${name}.type`);
                  if (!value && typeValue !== "graphic") {
                    return "L’url du pdf est requise";
                  }
                  return true;
                },
              },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="fileUrl" />
        </div>
        <div>
          <Field
            label="Taille du pdf"
            fullWidth
            {...register(`${name}.size`, {
              validate: {
                required: (value) => {
                  const typeValue = getValues(`${name}.type`);
                  if (!value && typeValue !== "graphic") {
                    return "La taille du pdf est requise";
                  }
                  return true;
                },
              },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="size" />
        </div>
        <SectionText name={name} />
      </Stack>
    </Box>
  );
};
