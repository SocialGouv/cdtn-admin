import { ErrorMessage } from "@hookform/error-message";
import slugify from "@socialgouv/cdtn-slugify";
import { SOURCES } from "@socialgouv/cdtn-utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { IoMdCheckmark } from "react-icons/io";

import { Content } from "../../types";
import { Button } from "../button";
import { MarkdownLink } from "../MarkdownLink";
import { ContentSections } from "./ContentSections";
import { ReferenceBlocks } from "./ReferenceBlocks";
import {
  AlertColor,
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField as Field,
} from "@mui/material";
import { FormRadioGroup, FormTextField } from "../forms";
import { SnackBar } from "../utils/SnackBar";
import { theme } from "src/theme";
import {
  EditorialContentBaseContentPart,
  EditorialSectionDisplayMode,
} from "@socialgouv/cdtn-types";

const addComputedFields =
  (onSubmit: (content: Partial<Content>) => void) =>
  (data: Partial<Content>) => {
    data.document?.references?.forEach((block) => {
      block.links.forEach((link) => {
        link.id = slugify(link.title);
        link.type = SOURCES.EXTERNALS;
      });
    });
    data.document?.contents?.forEach(
      (content: EditorialContentBaseContentPart) => {
        content.name = slugify(content.title as string);
        content.references?.forEach((block) => {
          block.links.forEach((reference) => {
            reference.id = slugify(reference.title);
            reference.type = SOURCES.EXTERNALS;
          });
        });
      }
    );
    onSubmit(data);
  };

const EditorialContentForm = ({
  onSubmit,
  loading = false,
  content,
}: {
  onSubmit: any;
  loading: boolean;
  content?: Partial<Content>;
}) => {
  const router = useRouter();
  const methods = useForm<Content>({
    defaultValues: content,
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { isDirty, errors, isSubmitted, isValid },
  } = methods;
  const [hasError, setHasError] = useState(false);
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });
  let buttonLabel = "Créer le contenu";
  if (!content) {
    content = {
      document: {
        contents: [{ blocks: [{ markdown: "", type: "markdown" }] }],
      },
    };
  }
  if (content?.cdtnId) {
    buttonLabel = "Enregistrer les changements";
  }
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      setHasError(true);
      console.log(errors);
      setSnack({
        open: true,
        severity: "error",
        message: "Formulaire invalide: " + JSON.stringify(errors),
      });
    }
  }, [errors]);
  useEffect(() => {
    if (isSubmitted && isValid) {
      setSnack({
        open: true,
        severity: "success",
        message: "Le contenu a été sauvegardé",
      });
    }
  }, [isSubmitted]);
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(addComputedFields(onSubmit))}>
        <Box sx={{ mb: "1rem" }}>
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
        <Box sx={{ mb: "1rem" }}>
          <FormTextField
            name="title"
            label="Titre"
            fullWidth
            control={control}
            rules={{ required: true }}
          />
        </Box>
        <Box sx={{ mb: "1rem" }}>
          <FormTextField
            name="metaDescription"
            fullWidth
            label="Meta description (référencement)"
            control={control}
            rules={{ required: true }}
          />
        </Box>
        <Box sx={{ mb: "1rem" }}>
          <FormTextField
            name="document.description"
            fullWidth
            multiline
            label="Description"
            control={control}
            rules={{ required: true }}
          />
        </Box>
        <Box sx={{ mb: "1rem" }}>
          <FormTextField
            name="document.intro"
            fullWidth
            multiline
            label="Introduction"
            control={control}
          />
          <MarkdownLink />
        </Box>
        <Box sx={{ mb: "1rem" }}>
          <FormRadioGroup
            name={"document.sectionDisplayMode"}
            label="Affichage des sections"
            control={control}
            options={[
              {
                label: "Accordéon",
                value: EditorialSectionDisplayMode.accordion,
              },
              {
                label: "Onglet",
                value: EditorialSectionDisplayMode.tab,
              },
            ]}
          />
        </Box>
        <Box sx={{ mb: "1rem" }}>
          <FormControlLabel
            control={
              <Controller
                name={"document.dismissalProcess"}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Checkbox
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                  />
                )}
              />
            }
            label="Dossier licenciement"
          />
        </Box>
        <ContentSections
          control={control}
          register={register}
          name="document.contents"
          errors={errors}
        />
        <Box
          sx={{
            display: "inline-flex",
            justifyContent: "flex-end",
            width: "100%",
            mb: "1rem",
          }}
        >
          <ReferenceBlocks
            control={control}
            register={register}
            name="document.references"
            errors={errors}
          />
        </Box>
        <Stack alignItems="center" direction="row" spacing={2}>
          <Button
            type="submit"
            variant="outlined"
            disabled={hasError || loading || !isDirty}
          >
            {isDirty && (
              <IoMdCheckmark
                style={{
                  height: theme.sizes.iconSmall,
                  marginRight: theme.space.xsmall,
                  width: theme.sizes.iconSmall,
                }}
              />
            )}
            {buttonLabel}
          </Button>
          <Link
            href={"/contenus"}
            passHref
            style={{ textDecoration: "none" }}
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
          >
            Annuler
          </Link>
        </Stack>
        <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
      </form>
    </FormProvider>
  );
};

export { EditorialContentForm };
