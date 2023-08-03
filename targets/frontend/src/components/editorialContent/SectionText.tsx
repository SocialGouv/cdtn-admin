import { useFormContext, useWatch } from "react-hook-form";
import { MarkdownLink } from "../MarkdownLink";
import { MarkdownPreviewModal } from "./MarkdownPreviewModal";
import { Box } from "@mui/material";
import { FormTextField } from "../forms";
import React from "react";

export type SectionTextProps = {
  name: string;
};

export const SectionText = ({ name }: SectionTextProps) => {
  const { control } = useFormContext();
  const markdown = useWatch({
    control,
    name: `${name}.markdown`,
  });
  return (
    <Box
      sx={{
        mb: "1rem",
        mt: "1rem",
      }}
    >
      <FormTextField
        name={`${name}.markdown`}
        fullWidth
        multiline
        label="Texte"
        control={control}
        rules={{ required: true }}
      />
      <MarkdownLink />
      {markdown && <MarkdownPreviewModal markdown={markdown} />}
    </Box>
  );
};
