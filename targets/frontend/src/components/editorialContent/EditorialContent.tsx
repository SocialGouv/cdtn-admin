import { ErrorMessage } from "@hookform/error-message";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { IoMdCheckmark } from "react-icons/io";
import { Button } from "src/components/button";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { MarkdownLink } from "src/components/MarkdownLink";
import { Content, SECTION_TYPES } from "src/types";
import { Box, Field, Flex, Label, NavLink, Switch, Textarea } from "theme-ui";

import { ContentSections } from "./ContentSections";
import { ReferenceBlocks } from "./ReferenceBlocks";

const addComputedFields =
  (onSubmit: (content: Content) => any) => (data: Content) => {
    data.document?.references?.forEach((block) => {
      block.links.forEach((link) => {
        link.id = slugify(link.title);
        link.type = SOURCES.EXTERNALS;
      });
    });
    data.document?.contents?.forEach((content) => {
      content.name = slugify(content.title as string);
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
}: {
  onSubmit: any;
  loading: boolean;
  content?: Content;
}) => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<Content>({
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
            {...register("document.date", {
              validate: (value?: string) => {
                if (!value) return false;
                const trimmed = value.trim();
                return /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(trimmed);
              },
            })}
            name="document.date"
            sx={{ width: "10rem" }}
            label="Date"
            defaultValue={content.document?.date as string}
          />
          <ErrorMessage
            name="document.date"
            errors={errors}
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
            {...register("title", {
              required: { message: "Le titre est requis", value: true },
            })}
            type="text"
            label="Titre"
            defaultValue={content?.title}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </Box>

        <Box mb="small">
          <Field
            {...register("metaDescription")}
            type="text"
            label="Meta description (référencement)"
            defaultValue={content.document?.metaDescription}
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
        <Box mb="small">
          <Switch {...register("document.isTab")} label="Affichage en onglet" />
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
            //@ts-ignore
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

export { EditorialContentForm };
