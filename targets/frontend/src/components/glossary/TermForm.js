import slugify from "@socialgouv/cdtn-slugify";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Lister } from "src/components/forms/Lister";
import { MarkdownLink } from "src/components/MarkdownLink";
import { Box, Field, Flex, Label, NavLink, Text, Textarea } from "theme-ui";
import { useMutation } from "urql";

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
  const { control, register, handleSubmit, errors } = useForm();
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
            name="term"
            label="Terme"
            onChange={() => setDuplicateTermError(false)}
            defaultValue={term.term}
            ref={register({
              required: { message: "Ce champ est requis", value: true },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="term" />
          {duplicateTermError && (
            <Text color="critical">Ce terme existe déjà !</Text>
          )}
        </Box>

        <Box mb="small">
          <Label htmlFor={"definition"}>
            Définition&nbsp;
            <MarkdownLink />
          </Label>
          <Textarea
            name="definition"
            id="definition"
            rows={5}
            defaultValue={term.definition}
            ref={register({
              required: { message: "Ce champ est requis", value: true },
            })}
          />
        </Box>

        <Flex
          sx={{
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "small",
            justifyContent: "stretch",
            mb: "small",
          }}
        >
          <Box sx={{ flex: "1 1 auto" }}>
            <Label htmlFor={"variants"}>Variantes / Synonymes</Label>
            <Lister
              control={control}
              name="variants"
              id="variants"
              defaultValue={term.variants}
            />
          </Box>
          <Box sx={{ flex: "1 1 auto" }}>
            <Label htmlFor={"abbreviations"}>Abréviations</Label>
            <Lister
              control={control}
              name="abbreviations"
              id="abbreviations"
              defaultValue={term.abbreviations}
            />
          </Box>
          <Box sx={{ flex: "1 1 auto" }}>
            <Label htmlFor={"references"}>Références</Label>
            <Lister
              control={control}
              name="references"
              id="references"
              defaultValue={term.references}
            />
          </Box>
        </Flex>

        <Flex sx={{ alignItems: "center", mt: "medium" }}>
          <Button disabled={hasError || loading}>{buttonLabel}</Button>
          <Link href="/glossary" passHref>
            <NavLink sx={{ ml: "medium" }}>Annuler</NavLink>
          </Link>
        </Flex>
      </>
    </form>
  );
};

TermForm.propTypes = {
  term: PropTypes.object,
};
