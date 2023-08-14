import slugify from "@socialgouv/cdtn-slugify";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Fieldset } from "src/components/forms/Fieldset";
import { Lister } from "src/components/forms/Lister";
import { MarkdownLink } from "src/components/MarkdownLink";
import {
  Box,
  Input as Field,
  InputLabel as Label,
  Textarea,
} from "@mui/material";
import { useMutation } from "urql";
import { theme } from "../../theme";

const editTermMutation = `
mutation EditTerm(
  $term: glossary_insert_input!
) {
  insert_glossary_one(
    object: $term,
    on_conflict: {
      constraint: glossary_pkey,
      update_columns: [
        abbreviations,
        definition,
        references,
        term,
        variants
      ]
    }
  ){
    id
  }
}
`;

export const TermForm = ({ term = {} }) => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,

    formState: { errors },
  } = useForm();
  const [editResult, editTerm] = useMutation(editTermMutation);
  const [duplicateTermError, setDuplicateTermError] = useState(false);

  async function onSubmit(data) {
    data.term = data.term.trim();
    data.definition = data.definition.trim();
    const result = await editTerm({
      term: {
        ...(term.id && { id: term.id }),
        ...data,
        slug: slugify(data.term),
      },
    });
    if (!result.error) {
      router.push("/glossary");
    } else if (
      result.error.graphQLErrors[0].extensions.code === "constraint-violation"
    ) {
      setDuplicateTermError(true);
    }
  }

  const loading = editResult.fetching;
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer";
  if (term.id) {
    buttonLabel = "Enregistrer les changements";
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <>
        <Box mb="small">
          <Field
            type="text"
            {...register("term", {
              required: { message: "Ce champ est requis", value: true },
            })}
            label="Terme"
            onChange={() => setDuplicateTermError(false)}
            defaultValue={term.term}
          />
          <FormErrorMessage errors={errors} fieldName="term" />
          {duplicateTermError && (
            <p
              style={{
                color: theme.colors.critical,
              }}
            >
              Ce terme existe déjà !
            </p>
          )}
        </Box>

        <Box mb="small">
          <Label htmlFor={"definition"}>
            Définition&nbsp;
            <MarkdownLink />
          </Label>
          <Textarea
            {...register("definition", {
              required: { message: "Ce champ est requis", value: true },
            })}
            id="definition"
            rows={5}
            defaultValue={term.definition}
          />
        </Box>

        <Box
          sx={{
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "small",
            justifyContent: "stretch",
            mb: "small",
            display: "flex",
          }}
        >
          <Fieldset title="Variantes / Synonymes" sx={{ flex: "1 1 auto" }}>
            <Lister
              control={control}
              name="variants"
              id="variants"
              defaultValue={term.variants}
            />
          </Fieldset>
          <Fieldset title="Abréviations" sx={{ flex: "1 1 auto" }}>
            <Lister
              control={control}
              name="abbreviations"
              id="abbreviations"
              defaultValue={term.abbreviations}
            />
          </Fieldset>
          <Fieldset title="Références" sx={{ flex: "1 1 auto" }}>
            <Lister
              control={control}
              name="references"
              id="references"
              defaultValue={term.references}
            />
          </Fieldset>
        </Box>

        <Box sx={{ alignItems: "center", mt: "medium", display: "flex" }}>
          <Button disabled={hasError || loading}>{buttonLabel}</Button>
          <Link href="/glossary" passHref>
            Annuler
          </Link>
        </Box>
      </>
    </form>
  );
};

TermForm.propTypes = {
  term: PropTypes.object,
};
