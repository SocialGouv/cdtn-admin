import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "src/components/button";
import { ContentPicker } from "src/components/forms/ContentPicker";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { IconPicker } from "src/components/forms/IconPicker";
import { Box, TextField as Field, InputLabel as Label } from "@mui/material";
import { theme as th } from "../../theme";

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
        <Box mb={th.space.small}>
          <Field
            type="text"
            {...register("title", {
              required: { message: "Ce champ est requis", value: true },
            })}
            label="Titre"
            defaultValue={theme.title}
            style={{
              width: "100%",
            }}
          />
          <FormErrorMessage errors={errors} fieldName="title" />
        </Box>

        <Box mb={th.space.small}>
          <Field
            type="text"
            {...register("shortTitle")}
            label="Titre court"
            defaultValue={theme.document?.shortTitle}
            style={{
              width: "100%",
            }}
          />
        </Box>

        <Box mb={th.space.small}>
          <Field
            type="text"
            {...register("metaDescription")}
            label="Meta description (référencement)"
            defaultValue={theme.metaDescription}
            style={{
              width: "100%",
            }}
          />
        </Box>

        <Box mb={th.space.small}>
          <Label htmlFor={"description"}>Description</Label>
          <textarea
            className="fr-input"
            {...register("description")}
            id="description"
            rows={5}
            defaultValue={theme.document?.description}
          />
        </Box>

        <Box mb={th.space.small}>
          <Label htmlFor={"icon"}>Icône</Label>
          <IconPicker
            control={control}
            name="icon"
            id="icon"
            defaultValue={theme.document?.icon}
          />
        </Box>

        <Box my={th.space.larger}>
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

        <Box
          sx={{ alignItems: "center", mt: th.space.medium, display: "flex" }}
        >
          <Button type="submit" disabled={hasError || loading}>
            {buttonLabel}
          </Button>
          <Link
            href={backLink}
            passHref
            style={{ textDecoration: "none", marginLeft: "10px" }}
          >
            Annuler
          </Link>
        </Box>
      </>
    </form>
  );
};

export { ThemeForm };
