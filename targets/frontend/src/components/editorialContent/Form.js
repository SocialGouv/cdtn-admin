/** @jsxImportSource theme-ui */

import { ErrorMessage } from "@hookform/error-message";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { IoMdCheckmark } from "react-icons/io";
import { Button } from "src/components/button";
import { ContentSections } from "src/components/editorialContent/ContentSections";
import { ReferenceBlocks } from "src/components/editorialContent/ReferenceBlocks";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { MarkdownLink } from "src/components/MarkdownLink";
import { Box, Field, Flex, Label, NavLink, Textarea } from "theme-ui";

import { TYPES as SECTION_TYPES } from "./ContentSections/Section";

const addComputedFields = (onSubmit) => (data) => {
  data.document?.references?.forEach((block) => {
    block.links.forEach((reference) => {
      reference.id = slugify(reference.title);
      reference.type = SOURCES.EXTERNALS;
    });
  });
  data.document?.contents?.forEach((content) => {
    content.name = slugify(content.title);
    content.references?.forEach((block) => {
      block.links.forEach((reference) => {
        reference.id = slugify(reference.title);
        reference.type = SOURCES.EXTERNALS;
      });
    });
  });
  onSubmit(data);
};

const EditorialContentForm = ({
  onSubmit,
  loading = false,
  content = {
    document: { contents: [{ type: SECTION_TYPES.MARKDOWN }] },
  },
}) => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,

    formState: { isDirty, errors },
  } = useForm({
    defaultValues: content,
  });
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer le contenu";
  if (content.cdtnId) {
    buttonLabel = "Enregistrer les changements";
  }

  return (
    <form onSubmit={handleSubmit(addComputedFields(onSubmit))}>
      <>
        <Box mb="small">
          <Field
            sx={{ width: "10rem" }}
            {...register("document.date", {
              validate: (value) => {
                const trimmed = value.trim();
                return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmed);
              },
            })}
            label="Date"
            defaultValue={content.document?.date}
          />
          <ErrorMessage
            errors={errors}
            name="document.date"
            render={() => (
              <Box color="critical">
                La date n’est pas formatée correctement. Le format attendu est
                &quot;jour/mois/année&quot;
              </Box>
            )}
          />
        </Box>

        <Box mb="small">
          <Field
            type="text"
            {...register("title", {
              required: { message: "Le titre est requis", value: true },
            })}
            label="Titre"
            defaultValue={content.title}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </Box>

        <Box mb="small">
          <Field
            type="text"
            {...register("metaDescription")}
            label="Meta description (référencement)"
            defaultValue={content.metaDescription}
          />
        </Box>

        <Box mb="small">
          <Label htmlFor={"description"}>Description</Label>
          <Textarea
            {...register("document.description", {
              required: { message: "La description est requise", value: true },
            })}
            id="description"
            rows={3}
            defaultValue={content.document?.description}
          />
          <FormErrorMessage errors={errors} fieldName="document.description" />
        </Box>
        <Box mb="small">
          <Label htmlFor={"intro"}>
            Introduction&nbsp;
            <MarkdownLink />
          </Label>
          <Textarea
            {...register("document.intro")}
            id="intro"
            rows={3}
            defaultValue={content.document?.intro}
          />
        </Box>
        <ContentSections
          control={control}
          register={register}
          name="document.contents"
          errors={errors}
        />
        <Flex sx={{ justifyContent: "flex-end", width: "100%" }}>
          <ReferenceBlocks
            control={control}
            register={register}
            name="document.references"
            errors={errors}
          />
        </Flex>

        <Flex mt="medium" sx={{ alignItems: "center" }}>
          <Button
            variant="secondary"
            disabled={hasError || loading || !isDirty}
          >
            {isDirty && (
              <IoMdCheckmark
                sx={{
                  height: "iconSmall",
                  mr: "xsmall",
                  width: "iconSmall",
                }}
              />
            )}
            {buttonLabel}
          </Button>
          <Link href={"/contenus"} passHref>
            <NavLink
              onClick={(e) => {
                e.preventDefault();
                router.back();
              }}
              ml="medium"
            >
              Annuler
            </NavLink>
          </Link>
        </Flex>
      </>
    </form>
  );
};

EditorialContentForm.propTypes = {
  content: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

export { EditorialContentForm };
