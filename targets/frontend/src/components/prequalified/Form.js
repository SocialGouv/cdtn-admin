/** @jsx jsx  */
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { IoMdCheckmark } from "react-icons/io";
import { Button } from "src/components/button";
import { ContentPicker } from "src/components/forms/ContentPicker/index";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Lister } from "src/components/forms/Lister";
import { Field, Flex, jsx, Label, NavLink } from "theme-ui";

const PrequalifiedForm = React.memo(
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
          onSubmit({
            ...values,
            isPublished: false,
            isSearchable: false,
            text: values.title,
          })
        )}
      >
        <>
          <div sx={{ mb: "small" }}>
            <Field
              type="text"
              name="title"
              label="Requete"
              defaultValue={content.title}
              ref={register({
                required: { message: "La requete est requiss", value: true },
              })}
            />
            <FormErrorMessage errors={errors} fieldName="title" />
          </div>

          <div sx={{ mb: "small" }}>
            <Label htmlFor={"variants"}>Variantes / Synonymes</Label>
            <Lister
              control={control}
              name="document.variants"
              id="variants"
              defaultValue={content.document?.variants}
            />
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

export { PrequalifiedForm };
