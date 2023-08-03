import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React from "react";
import { useForm } from "react-hook-form";
import { ContentPicker } from "../forms/ContentPicker";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Fieldset } from "src/components/forms/Fieldset";
import { HighLightContent } from "src/types";

import { ValidationBar } from "../prequalified";
import { Box, TextField, Typography } from "@mui/material";

const HighlightsForm = ({
  content = { contentRelations: [] },
  onSubmit,
  loading = false,
}: {
  content?: Partial<HighLightContent>;
  onSubmit: any;
  loading: boolean;
}) => {
  const router = useRouter();
  const {
    control,
    handleSubmit,

    formState: { isDirty, errors },

    register,
  } = useForm();
  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, isSearchable: false })
      )}
    >
      <>
        <Box sx={{ mb: "1rem" }}>
          <TextField
            type="text"
            {...register("title", {
              required: { message: "Le nom est requis", value: true },
            })}
            label="Nom"
            defaultValue={content.title}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </Box>
        <Box sx={{ mb: "1rem" }}>
          <TextField
            type="text"
            {...register("slug", {
              required: { message: "L’identifiant est requis", value: true },
            })}
            label="Indentifiant"
            defaultValue={content.slug}
          />
          <Typography>
            modifiez le uniquement si vous savez très précisément ce que vous
            faites
          </Typography>
          <FormErrorMessage errors={errors} fieldName="slug" />
        </Box>

        <Fieldset title="Contenus à mettre en avant">
          <ContentPicker
            control={control}
            name="contentRelations"
            id="contents"
            disabled={false}
            defaultValue={content?.contentRelations
              ?.sort(({ position: a = 0 }, { position: b = 0 }) => a - b)
              .map(({ relationId, content }) => ({
                relationId,
                ...content,
              }))}
          />
        </Fieldset>

        <ValidationBar isDirty={isDirty} loading={loading} router={router} />
      </>
    </form>
  );
};

HighlightsForm.propTypes = {
  content: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

const MemoisedHighlightsForm = React.memo(HighlightsForm);

export { MemoisedHighlightsForm as HighlightsForm };
