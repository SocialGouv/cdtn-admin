import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PrequalifiedResult } from "./prequalified.query";
import { prequalifiedSchema, Prequalified } from "./type";
import { FormAutocomplete } from "../forms";
import { Chip } from "@mui/material";

export const PrequalifiedForm = ({ data }: { data?: PrequalifiedResult }) => {
  const prequalifiedFormBaseSchema = prequalifiedSchema.pick({
    documents: true,
    variants: true,
  });
  const [open, setOpen] = useState(false);
  const { control } = useForm<Prequalified>({
    resolver: zodResolver(prequalifiedFormBaseSchema),
    shouldFocusError: true,
    defaultValues: {
      documents: [],
      variants: [],
    },
  });

  return (
    <>
      <FormAutocomplete
        name="variants"
        control={control}
        getOptionLabel={() => "toto"}
        label="Variants"
        options={[]}
        filterOptions={(options) => options}
        isOptionEqualToValue={() => true}
        loading={false}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        onInputChange={(_, newValue) => {
          console.log(newValue);
        }}
        renderTags={(value, getTagProps) =>
          value.map((item, index: number) => (
            <Chip
              sx={{
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                },
                height: "auto",
              }}
              color="primary"
              variant="outlined"
              key={index}
            />
          ))
        }
        fullWidth
      ></FormAutocomplete>
    </>
  );
};
