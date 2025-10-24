import {
  Alert,
  AlertColor,
  AlertTitle,
  Button,
  CircularProgress,
  FormControl,
  Stack
} from "@mui/material";
import {
  DropzoneFile,
  FormEditionField,
  FormFileField,
  FormTextField,
  FormToggleButtonGroup,
  FormDatePicker
} from "src/components/forms";

import { Controller, useForm } from "react-hook-form";
import { Model, modelSchema } from "../../type";
import React, { useState } from "react";
import mammoth from "mammoth";
import { TitleBox } from "src/components/forms/TitleBox";
import { request } from "src/lib/request";
import { SnackBar } from "src/components/utils/SnackBar";
import { LegiReferenceInput } from "src/components/contributions/answers/references";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormOtherReferences } from "../../../../components/forms/OtherReferences";
import { LoadingButton } from "../../../../components/button/LoadingButton";
import { ALLOWED_DOC } from "../../../../lib/secu";

type FormData = Partial<z.infer<typeof modelSchemaUpsert>>;

export type FormDataResult = Required<Omit<Model, "createdAt" | "updatedAt">>;

type Props = {
  model?: Model;
  onUpsert: (props: FormDataResult) => Promise<void>;
  onPublish?: () => Promise<void>;
};

const defaultValues: FormData = {
  title: "",
  metaTitle: "",
  intro: "",
  metaDescription: "",
  type: undefined,
  previewHTML: "",
  legiReferences: [],
  otherReferences: []
};

export const modelSchemaUpsert = modelSchema
  .extend({
    newFile: z.array(z.custom<DropzoneFile>()).optional()
  })
  .omit({ updatedAt: true, createdAt: true, file: true })
  .superRefine(({ newFile, id }, refinementContext) => {
    if (!id && !newFile) {
      return refinementContext.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Un fichier doit être renseigné",
        path: ["newFile"]
      });
    }
  });

export const ModelForm = ({
  model,
  onUpsert,
  onPublish
}: Props): React.ReactElement => {
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | undefined>(
    undefined
  );

  const { control, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      ...model
    },
    resolver: zodResolver(modelSchemaUpsert),
    shouldFocusError: true
  });

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false
  });

  const uploadFile = async (file: DropzoneFile) => {
    const formData = new FormData();
    formData.append(file.path, file);
    return new Promise((resolve, reject) => {
      request(`/api/storage`, {
        body: formData
      })
        .then(() => {
          resolve(file);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const onSubmit = async (newData: FormData) => {
    try {
      if (newData.newFile && newData.newFile.length === 1) {
        await uploadFile(newData.newFile[0]);
      }
      await onUpsert({
        id: newData.id!,
        title: newData.title!,
        metaTitle: newData.metaTitle!,
        intro: newData.intro!,
        metaDescription: newData.metaDescription!,
        type: newData.type!,
        file: newData.newFile
          ? {
              url: newData.newFile[0].path,
              size: `${newData.newFile[0].size}`
            }
          : model?.file!,
        previewHTML: newData.previewHTML!,
        legiReferences: newData.legiReferences!,
        otherReferences: newData.otherReferences!,
        displayDate: newData.displayDate!
      });
      setSnack({
        open: true,
        severity: "success",
        message: model
          ? "Le modèle a été modifié avec succès"
          : "Le modèle a été créé avec succès"
      });
    } catch (error) {
      console.error("Echec à la sauvegarde", error);
      setSnack({
        open: true,
        severity: "error",
        message: "Une erreur est survenue lors de la sauvegarde du modèle"
      });
    }
  };
  const [isPublishing, setIsPublishing] = useState(false);

  const convertToHTML = async (file: File) => {
    setIsLoadingPreview(true);
    setPreviewError(undefined);
    setValue("previewHTML", undefined);
    const reader = new FileReader();
    reader.onloadend = () => {
      const arrayBufferTmp = reader.result;
      if (!arrayBufferTmp || typeof arrayBufferTmp === "string") {
        setValue("previewHTML", undefined);
        setIsLoadingPreview(false);
        setPreviewError(
          "Impossible de lire le fichier (pas de type ArrayBuffer)"
        );
      }

      const arrayBuffer = arrayBufferTmp as ArrayBuffer;
      mammoth
        .convertToHtml({ arrayBuffer }, mammothOptions)
        .then((resultObject) => {
          setValue("previewHTML", resultObject.value);
          setIsLoadingPreview(false);
        })
        .catch((error) => {
          setValue("previewHTML", undefined);
          setIsLoadingPreview(false);
          setPreviewError(
            `Erreur dans la génération de l'aperçu: ${error.message}`
          );
        });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FormControl>
          <FormDatePicker
            name="displayDate"
            control={control}
            label="Date mise à jour"
          />
        </FormControl>
        <FormControl>
          <FormToggleButtonGroup
            name="type"
            label="Type"
            control={control}
            options={[
              {
                label: "Fichier",
                value: "fichier"
              },
              {
                label: "Document",
                value: "document"
              },
              {
                label: "Lettre",
                value: "lettre"
              }
            ]}
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="title"
            control={control}
            label="Titre"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="metaTitle"
            control={control}
            label="Méta titre"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormEditionField
            label="Introduction"
            name="intro"
            control={control}
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name="metaDescription"
            control={control}
            label="Méta description"
            fullWidth
          />
        </FormControl>
        <FormControl>
          <LegiReferenceInput name="legiReferences" control={control} />
        </FormControl>
        <FormControl>
          <FormOtherReferences name="otherReferences" control={control} />
        </FormControl>
        <FormControl>
          <FormFileField
            name="newFile"
            control={control}
            label="Modèle de courrier"
            defaultFileName={model?.file?.url}
            accept={{
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                ALLOWED_DOC
            }}
            onFileChange={(file) => {
              if (file) {
                convertToHTML(file);
              } else {
                setValue("previewHTML", undefined);
              }
            }}
          />
        </FormControl>
        <FormControl>
          <Controller
            name="previewHTML"
            control={control}
            render={({ field: { value } }) => (
              <TitleBox title="Aperçu du modèle" isError={!!previewError}>
                {isLoadingPreview ? (
                  <CircularProgress />
                ) : previewError ? (
                  <Alert severity="error">
                    <AlertTitle>Erreur</AlertTitle>
                    L&apos;aperçu n&apos;est pas disponible. Erreur:{" "}
                    {previewError}
                  </Alert>
                ) : value ? (
                  <div
                    style={{ maxWidth: 700, margin: "auto" }}
                    dangerouslySetInnerHTML={{ __html: value }}
                  />
                ) : (
                  <Alert severity="info">
                    <AlertTitle>Attente du fichier</AlertTitle>
                    En attente du fichier pour générer l&apos;aperçu.
                  </Alert>
                )}
              </TitleBox>
            )}
          />
        </FormControl>
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button variant="contained" type="submit">
            {model ? "Sauvegarder" : "Créer"}
          </Button>
          {onPublish && (
            <LoadingButton
              loading={isPublishing}
              onClick={async () => {
                setIsPublishing(true);

                try {
                  await onPublish();
                  setSnack({
                    open: true,
                    severity: "success",
                    message: "Le modèle de document a été publiée"
                  });
                  setIsPublishing(false);
                } catch (e: any) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: `Erreur lors de la publication du document: ${e.message}`
                  });
                  setIsPublishing(false);
                }
              }}
            >
              Publier
            </LoadingButton>
          )}
        </Stack>
      </Stack>
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </form>
  );
};

const mammothOptions = {
  styleMap: [
    "p[style-name='signature'] => div.courrier-signature > p:fresh",
    "p[style-name='choix'] => li.checklist:fresh",
    "p[style-name='centre'] => div.center > p:fresh",
    "p[style-name='Titre-centre'] => div.title-center:fresh",
    "p[style-name='expediteur'] => div.courrier-expediteur > p:fresh",
    "p[style-name='destinataire'] => div.courrier-destinataire > p:fresh",
    "p[style-name='Titre'] => h3.courrier-titre:fresh",
    "r[style-name='options'] => span.options",
    "r[style-name='editable'] => span.editable"
  ]
};
