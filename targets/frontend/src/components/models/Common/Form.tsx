import {
  Alert,
  AlertColor,
  AlertTitle,
  Button,
  CircularProgress,
  FormControl,
  Stack,
} from "@mui/material";
import {
  DropzoneFile,
  FormEditionField,
  FormFileField,
  FormTextField,
  FormToggleButtonGroup,
} from "src/components/forms";
import { Controller, useForm } from "react-hook-form";
import { Model } from "../type";
import React, { useState } from "react";
import mammoth from "mammoth";
import { TitleBox } from "src/components/forms/TitleBox";
import { request } from "src/lib/request";
import { getToken } from "src/lib/auth/token";
import { SnackBar } from "src/components/utils/SnackBar";
import { LegiReferenceInput } from "src/components/contributions/answers/references";

type FormData = Partial<Omit<Model, "createdAt">> & {
  newFile?: DropzoneFile[];
};

type FormDataResult = Required<Omit<FormData, "newFile">>;

type Props = {
  model?: Model;
  onUpsert: (props: FormDataResult) => Promise<void>;
};

export const ModelForm = ({ model, onUpsert }: Props): React.ReactElement => {
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
  const [previewError, setPreviewError] = React.useState<string | undefined>(
    undefined
  );

  const { control, handleSubmit, setValue } = useForm<FormData>({
    values: model,
    defaultValues: {
      updatedAt: "",
      title: "",
      description: "",
      fileName: "",
      fileSize: 0,
      previewHTML: "",
      legiReferences: [],
    },
  });

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const uploadFile = async (file: DropzoneFile) => {
    const formData = new FormData();
    formData.append(file.path, file);
    return new Promise((resolve, reject) => {
      request(`/api/storage`, {
        body: formData,
        headers: { token: getToken()?.jwt_token || "" },
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
        description: newData.description!,
        type: newData.type!,
        fileName: newData.newFile ? newData.newFile[0].path : newData.fileName!,
        fileSize: newData.newFile ? newData.newFile[0].size : newData.fileSize!,
        previewHTML: newData.previewHTML!,
        updatedAt: newData.updatedAt!,
        legiReferences: newData.legiReferences!,
      });
      setSnack({
        open: true,
        severity: "success",
        message: model
          ? "Le modèle a été modifié avec succès"
          : "Le modèle a été créé avec succès",
      });
    } catch (error) {
      console.error("Echec à la sauvegarde", error);
      setSnack({
        open: true,
        severity: "error",
        message: "Une erreur est survenue lors de la sauvegarde du modèle",
      });
    }
  };

  const convertToHTML = async (file: File) => {
    setIsLoadingPreview(true);
    setPreviewError(undefined);
    setValue("previewHTML", undefined);
    const reader = new FileReader();
    reader.onloadend = () => {
      const arrayBufferTmp = reader.result;
      if (!arrayBufferTmp || typeof arrayBufferTmp === "string") {
        console.log(
          "Erreur dans la génération de l'aperçu",
          "Impossible de lire le fichier (pas de type ArrayBuffer)"
        );
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
          console.log("Erreur dans la génération de l'aperçu", error);
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
        {model && (
          <FormControl>
            <FormTextField
              name="updatedAt"
              control={control}
              label="Date mise à jour"
              disabled
              labelFixed
            />
          </FormControl>
        )}
        <FormControl>
          <FormTextField
            name="title"
            control={control}
            label="Titre"
            rules={{ required: true }}
            fullWidth
          />
        </FormControl>
        <FormControl>
          <FormToggleButtonGroup
            name="type"
            label="Type"
            control={control}
            rules={{ required: true }}
            options={[
              {
                label: "Fichier",
                value: "fichier",
              },
              {
                label: "Document",
                value: "document",
              },
              {
                label: "Lettre",
                value: "letter",
              },
            ]}
          />
        </FormControl>
        <FormControl>
          <FormEditionField
            label="Description"
            name="description"
            control={control}
            rules={{
              required: true,
            }}
          />
        </FormControl>
        <FormControl>
          <LegiReferenceInput name="legiReferences" control={control} />
        </FormControl>
        <FormControl>
          <FormFileField
            name="newFile"
            control={control}
            label="Modèle de courrier"
            rules={{ required: !model }}
            defaultFileName={model?.fileName}
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
            rules={{ required: true }}
            render={({ field: { value } }) => (
              <TitleBox title="Aperçu du modèle">
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
    "r[style-name='editable'] => span.editable",
  ],
};
