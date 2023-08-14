import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React from "react";
import { useForm } from "react-hook-form";
import { ContentPicker } from "src/components/forms/ContentPicker/index";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Fieldset } from "src/components/forms/Fieldset";
import { Lister } from "src/components/forms/Lister";
import { PrequalifiedContent } from "src/types";
import { Input as Field, InputLabel } from "@mui/material";

import { ValidationBar } from "./ValidationBar";
import { theme } from "src/theme";

const PrequalifiedForm = ({
  content = { contentRelations: [] },
  onSubmit,
  loading = false,
}: {
  content?: Partial<PrequalifiedContent>;
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
        onSubmit({
          ...values,
          isPublished: false,
          isSearchable: false,
          text: values.title,
        })
      )}
    >
      <>
        <div style={{ marginBottom: theme.space.small }}>
          <InputLabel htmlFor="title">Requete</InputLabel>
          <Field
            type="text"
            {...register("title", {
              required: { message: "La requete est requise", value: true },
            })}
            defaultValue={content.title}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </div>

        <Fieldset title="Variantes / Synonymes" sx={{ mb: "small" }}>
          <Lister
            control={control}
            name="document.variants"
            id="variants"
            disabled={false}
            defaultValue={content?.document?.variants}
          />
        </Fieldset>

        <Fieldset title="Contenus">
          <ContentPicker
            control={control}
            disabled={false}
            name="contentRelations"
            id="contents"
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

PrequalifiedForm.propTypes = {
  content: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

const MemoisedPrequalifiedForm = React.memo(PrequalifiedForm);

export { MemoisedPrequalifiedForm as PrequalifiedForm };
