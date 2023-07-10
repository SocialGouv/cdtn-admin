import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IoMdClose } from "react-icons/io";

import { ContentLink } from "../../types";
import { Button } from "../button";
import { Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { FormTextField } from "../forms";

export const References = ({ nestName }: { nestName: string }) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    keyName: "key",
    name: nestName,
  });

  const references = fields as ContentLink[];

  useEffect(() => {
    if (references.length === 0) {
      append({});
    }
  }, [references, append]);
  return (
    <>
      {references.map((reference, index) => (
        <Stack
          direction="row"
          spacing={2}
          key={reference.key}
          sx={{ mb: "1rem", mt: "1rem" }}
        >
          <FormTextField
            name={`${nestName}.${index}.title`}
            label="Label"
            control={control}
            rules={{ required: true }}
            size="small"
          />
          <FormTextField
            name={`${nestName}.${index}.url`}
            label="URL"
            control={control}
            rules={{ required: true }}
            size="small"
            fullWidth
          />

          {references.length > 1 && (
            <Button
              type="button"
              variant="primary"
              outline
              onClick={() => remove(index)}
              sx={{ flex: "0 0 auto", mt: "medium" }}
            >
              <IoMdClose sx={{ height: "1.5rem", width: "1.5rem" }} />
            </Button>
          )}
        </Stack>
      ))}
      <Box sx={{ mt: "small" }}>
        <Button
          type="button"
          size="small"
          onClick={() => append({})}
          variant="secondary"
          outline
        >
          Ajouter une référence au bloc
        </Button>
      </Box>
    </>
  );
};

References.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  nestName: PropTypes.string.isRequired,
  register: PropTypes.func.isRequired,
};
