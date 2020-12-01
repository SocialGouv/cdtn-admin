/** @jsx jsx  */
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
import { Field, Flex, jsx, Label, NavLink, Textarea } from "theme-ui";

import { TYPES as SECTION_TYPES } from "./ContentSections/Section";

const addComputedFields = (onSubmit) => (data) => {
  data.references?.forEach((block) => {
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
  editorialContent = {
    document: { contents: [{ type: SECTION_TYPES.MARKDOWN }] },
  },
}) => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    errors,
    formState: { isDirty },
  } = useForm({
    defaultValues: editorialContent,
  });
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer le contenu";
  if (editorialContent.cdtnId) {
    buttonLabel = "Enregistrer les changements";
  }

  return (
    <form onSubmit={handleSubmit(addComputedFields(onSubmit))}>
      <>
        <div sx={{ mb: "small" }}>
          <Field
            sx={{ width: "10rem" }}
            name="document.date"
            label="Date"
            defaultValue={editorialContent.document?.date}
            ref={register({
              validate: (value) => {
                const trimmed = value.trim();
                return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmed);
              },
            })}
          />
          <ErrorMessage
            errors={errors}
            name="document.date"
            render={() => (
              <div sx={{ color: "critical" }}>
                La date n’est pas formatée correctement. Le format attendu est
                &quot;jour/mois/année&quot;
              </div>
            )}
          />
        </div>

        <div sx={{ mb: "small" }}>
          <Field
            type="text"
            name="title"
            label="Titre"
            defaultValue={editorialContent.title}
            ref={register({
              required: { message: "Le titre est requis", value: true },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </div>

        <div sx={{ mb: "small" }}>
          <Field
            type="text"
            name="metaDescription"
            label="Meta description (référencement)"
            defaultValue={editorialContent.metaDescription}
            ref={register}
          />
        </div>

        <div sx={{ mb: "small" }}>
          <Label htmlFor={"description"}>Description</Label>
          <Textarea
            name="document.description"
            id="description"
            rows={3}
            defaultValue={editorialContent.document?.description}
            ref={register({
              required: { message: "La description est requise", value: true },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="document.description" />
        </div>
        <div sx={{ mb: "small" }}>
          <Label htmlFor={"intro"}>
            Introduction&nbsp;
            <MarkdownLink />
          </Label>
          <Textarea
            name="document.intro"
            id="intro"
            rows={3}
            defaultValue={editorialContent.document?.intro}
            ref={register}
          />
        </div>
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

        <Flex sx={{ alignItems: "center", mt: "medium" }}>
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
              sx={{ ml: "medium" }}
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
  editorialContent: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

export { EditorialContentForm };
