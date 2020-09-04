/** @jsx jsx  */

import Link from "next/link";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { ContentPicker } from "src/components/forms/ContentPicker/index";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { IconPicker } from "src/components/forms/IconPicker";
import { useUser } from "src/hooks/useUser";
import { Checkbox, Field, Flex, jsx, Label, NavLink, Textarea } from "theme-ui";

const ThemeForm = ({ parentId, onSubmit, loading = false, theme = {} }) => {
  const { isAdmin } = useUser();
  const { control, register, handleSubmit, errors } = useForm();
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer";
  let backLink = `/themes`;
  if (theme.id) {
    buttonLabel = "Enregistrer les changements";
    backLink += `/${theme.id}`;
  } else if (parentId) {
    backLink += `/${parentId}`;
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <>
        <Flex sx={{ mb: "small" }}>
          <Label
            htmlFor="isPublished"
            sx={{
              color: "primary",
              fontSize: "large",
              ...(isAdmin && { cursor: "pointer" }),
            }}
          >
            <span sx={{ mr: "xsmall" }}>Publié</span>
            <Checkbox
              disabled={!isAdmin}
              name="isPublished"
              id="isPublished"
              defaultChecked={theme.id ? theme.isPublished : true}
              ref={register()}
              sx={{ height: "2.2rem", width: "2.2rem" }}
            />
          </Label>
          <Label
            htmlFor="isSpecial"
            sx={{
              color: "primary",
              fontSize: "large",
              ...(isAdmin && { cursor: "pointer" }),
            }}
          >
            <span sx={{ mr: "xsmall" }}>Spécial</span>
            <Checkbox
              disabled={!isAdmin}
              name="isSpecial"
              id="isSpecial"
              defaultChecked={theme.id ? theme.isSpecial : false}
              ref={register()}
              sx={{ height: "2.2rem", width: "2.2rem" }}
            />
          </Label>
        </Flex>
        <div sx={{ mb: "small" }}>
          <Field
            disabled={!isAdmin}
            type="text"
            name="title"
            label="Titre"
            defaultValue={theme.title}
            ref={register({
              required: { message: "Ce champ est requis", value: true },
            })}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </div>

        <div sx={{ mb: "small" }}>
          <Field
            disabled={!isAdmin}
            type="text"
            name="shortTitle"
            label="Titre court"
            defaultValue={theme.shortTitle}
            ref={register}
          />
        </div>

        <div sx={{ mb: "small" }}>
          <Label htmlFor={"description"}>Description</Label>
          <Textarea
            disabled={!isAdmin}
            name="description"
            id="description"
            rows={5}
            defaultValue={theme.description}
            ref={register}
          />
        </div>

        <div sx={{ mb: "small" }}>
          <Label htmlFor={"icon"}>Icône</Label>
          <IconPicker
            control={control}
            disabled={!isAdmin}
            name="icon"
            id="icon"
            defaultValue={theme.icon}
          />
        </div>

        <div sx={{ my: "larger" }}>
          <h2>Contenus du thème</h2>
          <ContentPicker
            control={control}
            disabled={!isAdmin}
            name="contents"
            id="contents"
            defaultValue={
              (theme.contents &&
                theme.contents
                  .sort(({ themePosition: a }, { themePosition: b }) => a - b)
                  .map(({ relationId, content }) => ({
                    relationId,
                    ...content,
                  }))) ||
              []
            }
          />
        </div>

        {isAdmin ? (
          <Flex sx={{ alignItems: "center", mt: "medium" }}>
            <Button variant="secondary" disabled={hasError || loading}>
              {buttonLabel}
            </Button>
            <Link href="/themes/[[...id]]" as={backLink} passHref>
              <NavLink sx={{ ml: "medium" }}>Annuler</NavLink>
            </Link>
          </Flex>
        ) : (
          <Link href="/themes/[[...id]]" as={backLink} passHref>
            <Button as="a" variant="secondary" sx={{ display: "inline-block" }}>
              Retour à la liste
            </Button>
          </Link>
        )}
      </>
    </form>
  );
};

ThemeForm.propTypes = {
  edit: PropTypes.bool,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  parentId: PropTypes.string,
  theme: PropTypes.object,
};

export { ThemeForm };

const DisplayField = ({ children, label }) => (
  <div sx={{ m: "small" }}>
    <div sx={{ fontWeight: "bold", mb: "xxsmall" }}>{label} :</div>
    <div
      sx={{
        bg: "highlight",
        borderRadius: "small",
        display: "inline-block",
        p: "small",
      }}
    >
      {children}
    </div>
  </div>
);

DisplayField.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
};
