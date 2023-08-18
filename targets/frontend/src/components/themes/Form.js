import Link from "next/link";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { ContentPicker } from "src/components/forms/ContentPicker/index";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { IconPicker } from "src/components/forms/IconPicker";
import { Box, TextField as Field, Label } from "@mui/material";

const ThemeForm = ({ parentId, onSubmit, loading = false, theme = {} }) => {
  const {
    control,
    register,
    handleSubmit,

    formState: { errors },
  } = useForm();
  const hasError = Object.keys(errors).length > 0;
  let buttonLabel = "Créer";
  let backLink = `/themes`;
  if (theme.cdtnId) {
    buttonLabel = "Enregistrer les changements";
    backLink += `/${theme.cdtnId}`;
  } else if (parentId) {
    backLink += `/${parentId}`;
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <>
        <Box mb="small">
          <Field
            type="text"
            {...register("title", {
              required: { message: "Ce champ est requis", value: true },
            })}
            label="Titre"
            defaultValue={theme.title}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </Box>

        <Box mb="small">
          <Field
            type="text"
            {...register("shortTitle")}
            label="Titre court"
            defaultValue={theme.document?.shortTitle}
          />
        </Box>

        <Box mb="small">
          <Field
            type="text"
            {...register("metaDescription")}
            label="Meta description (référencement)"
            defaultValue={theme.metaDescription}
          />
        </Box>

        <Box mb="small">
          <Label htmlFor={"description"}>Description</Label>
          <textarea
            className="fr-input"
            {...register("description")}
            id="description"
            rows={5}
            defaultValue={theme.document?.description}
          />
        </Box>

        <Box mb="small">
          <Label htmlFor={"icon"}>Icône</Label>
          <IconPicker
            control={control}
            name="icon"
            id="icon"
            defaultValue={theme.document?.icon}
          />
        </Box>

        <Box my="larger">
          <h2>Contenus du thème</h2>
          <ContentPicker
            control={control}
            name="contents"
            id="contents"
            defaultValue={
              (theme.contentRelations &&
                theme.contentRelations
                  .sort(({ position: a }, { position: b }) => a - b)
                  .map(({ relationId, content }) => ({
                    relationId,
                    ...content,
                  }))) ||
              []
            }
          />
        </Box>

        <Box sx={{ alignItems: "center", mt: "medium", display: "flex" }}>
          <Button variant="secondary" disabled={hasError || loading}>
            {buttonLabel}
          </Button>
          <Link href={backLink} passHref style={{ textDecoration: "none" }}>
            Annuler
          </Link>
        </Box>
      </>
    </form>
  );
};

ThemeForm.propTypes = {
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  parentId: PropTypes.string,
  theme: PropTypes.object,
};

export { ThemeForm };
