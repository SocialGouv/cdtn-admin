/** @jsx jsx  */
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { IoMdCheckmark } from "react-icons/io";
import { Button } from "src/components/button";
import { ContentPicker } from "src/components/forms/ContentPicker/index";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Field, Flex, jsx, NavLink } from "theme-ui";

const HighlightsForm = React.memo(
  ({ content = { contentRelations: [] }, onSubmit, loading }) => {
    const router = useRouter();
    const {
      control,
      errors,
      handleSubmit,
      formState: { isDirty },
      register,
    } = useForm();
    return (
      <form
        onSubmit={handleSubmit((values) =>
          onSubmit({ ...values, isSearchable: false })
        )}
      >
        <>
          <div sx={{ mb: "small" }}>
            <Field
              type="text"
              name="title"
              label="Nom"
              defaultValue={content.title}
              ref={register({
                required: { message: "Le nom est requis", value: true },
              })}
            />
            <FormErrorMessage errors={errors} fieldName="title" />
          </div>
          <div sx={{ mb: "small" }}>
            <Field
              type="text"
              name="slug"
              label="Indentifiant (modifiez le uniquement si vous savez très précisément ce que vous faites)"
              defaultValue={content.slug}
              ref={register({
                required: { message: "L’identifiant est requis", value: true },
              })}
            />
            <FormErrorMessage errors={errors} fieldName="slug" />
          </div>

          <h3>Contenus: </h3>
          <ContentPicker
            control={control}
            name="contents"
            id="contents"
            defaultValue={content.contentRelations
              .sort(({ position: a }, { position: b }) => a - b)
              .map(({ relationId, content }) => ({
                relationId,
                ...content,
              }))}
          />

          <Flex sx={{ alignItems: "center", mt: "medium" }}>
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
  }
);

export { HighlightsForm };
