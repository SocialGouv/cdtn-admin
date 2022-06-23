import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import React from "react";
import { useForm } from "react-hook-form";
import { IoMdCheckmark } from "react-icons/io";
import { Button } from "src/components/button";
import { ContentPicker } from "src/components/forms/ContentPicker/index";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Fieldset } from "src/components/forms/Fieldset";
import { HighLightContent } from "src/types";
import { Box, Field, Flex, NavLink } from "theme-ui";

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
        <Box mb="small">
          <Field
            type="text"
            {...register("title", {
              required: { message: "Le nom est requis", value: true },
            })}
            label="Nom"
            defaultValue={content.title}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </Box>
        <Box mb="small">
          <Field
            type="text"
            {...register("slug", {
              required: { message: "L’identifiant est requis", value: true },
            })}
            label="Indentifiant (modifiez le uniquement si vous savez très précisément ce que vous faites)"
            defaultValue={content.slug}
          />
          <FormErrorMessage errors={errors} fieldName="slug" />
        </Box>

        <Fieldset title="Contenus à mettre en avant">
          <ContentPicker
            control={control}
            name="contents"
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

        <Flex sx={{ alignItems: "center", mt: "medium" }}>
          {/* @ts-ignore */}
          <Button variant="secondary" disabled={loading || !isDirty}>
            {isDirty && (
              <IoMdCheckmark
                sx={{
                  height: "iconSmall",
                  mr: "xsmall",
                  width: "iconSmall",
                }}
              />
            )}
            Enregistrer
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

HighlightsForm.propTypes = {
  content: PropTypes.object,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
};

const MemoisedHighlightsForm = React.memo(HighlightsForm);

export { MemoisedHighlightsForm as HighlightsForm };
