import { AlertColor, Box, Button, FormControl, Stack } from "@mui/material";
import {
  DropzoneFile,
  FormDatePicker,
  FormEditionField,
  FormFileField,
  FormTextField,
} from "src/components/forms";

import { useForm } from "react-hook-form";
import { Infographic, infographicSchema } from "../../type";
import React, { useState } from "react";
import { request } from "src/lib/request";
import { SnackBar } from "src/components/utils/SnackBar";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingButton } from "../../../../components/button/LoadingButton";
import { ALLOWED_PDF, ALLOWED_SVG } from "../../../../lib/secu";
import { buildFilePathUrl } from "../../../../components/utils";
import Image from "next/image";

type FormData = Partial<z.infer<typeof infographicSchemaInsert>>;

export type FormDataResult = Required<
  Omit<Infographic, "createdAt" | "updatedAt">
>;

type Props = {
  infographic?: Infographic;
  onUpsert: (props: FormDataResult) => Promise<void>;
  onPublish?: () => Promise<void>;
};

const defaultValues: FormData = {
  title: "",
  metaTitle: "",
  description: "",
  metaDescription: "",
  transcription: "",
};

export const infographicSchemaInsert = infographicSchema
  .extend({
    newSvg: z
      .array(z.custom<DropzoneFile>())
      .min(1, "Une infographie au format SVG doit être renseignée"),
    newPdf: z
      .array(z.custom<DropzoneFile>())
      .min(1, "Le format PDF de l'infographie doit être renseigné"),
  })
  .omit({ updatedAt: true, createdAt: true, pdfFile: true, svgFile: true });

export const infographicSchemaUpdate = infographicSchema
  .extend({
    newSvg: z.array(z.custom<DropzoneFile>()).optional(),
    newPdf: z.array(z.custom<DropzoneFile>()).optional(),
  })
  .omit({ updatedAt: true, createdAt: true, pdfFile: true, svgFile: true });

export const InfographicForm = ({
  infographic,
  onUpsert,
  onPublish,
}: Props): React.ReactElement => {
  const { control, handleSubmit, formState, getValues } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      ...infographic,
    },
    resolver: zodResolver(
      infographic ? infographicSchemaUpdate : infographicSchemaInsert,
    ),
    shouldFocusError: true,
  });

  console.log("Form : ", formState.errors);
  console.log("Form values : ", getValues());

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
      if (newData.newSvg && newData.newSvg.length === 1) {
        await uploadFile(newData.newSvg[0]);
      }
      await onUpsert({
        id: newData.id!,
        title: newData.title!,
        metaTitle: newData.metaTitle!,
        description: newData.description!,
        metaDescription: newData.metaDescription!,
        svgFile: newData.newSvg
          ? {
              url: newData.newSvg[0].path,
              size: `${newData.newSvg[0].size}`,
            }
          : infographic?.svgFile!,
        transcription: newData.transcription!,
        displayDate: newData.displayDate!,

        pdfFile: newData.newPdf
          ? {
              url: newData.newPdf[0].path,
              size: `${newData.newPdf[0].size}`,
            }
          : infographic?.pdfFile!,
      });
      setSnack({
        open: true,
        severity: "success",
        message: infographic
          ? "L'infographie a été modifiée avec succès"
          : "L'infographie a été créée avec succès",
      });
    } catch (error) {
      console.error("Echec à la sauvegarde", error);
      setSnack({
        open: true,
        severity: "error",
        message:
          "Une erreur est survenue lors de la sauvegarde de l'infographie",
      });
    }
  };

  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadSvgFile, setUploadSvgFile] = useState<File | undefined>();

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
            label="Description"
            name="description"
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
          <FormFileField
            name="newSvg"
            control={control}
            label="Infographie au format SVG"
            accept={{
              "application/svg": ALLOWED_SVG,
            }}
            onFileChange={(file) => {
              setUploadSvgFile(file);
            }}
            defaultFileName={infographic?.svgFile?.url}
          />
        </FormControl>
        <ImagePreview
          file={uploadSvgFile}
          defaultValue={infographic?.svgFile?.url}
        />
        <FormControl>
          <FormEditionField
            name="transcription"
            label="Contenu de l'inforgraphie pour l'accessibilité"
            control={control}
          />
        </FormControl>
        <FormControl>
          <FormFileField
            name="newPdf"
            control={control}
            label="Infographie au format PDF"
            accept={{
              "application/pdf": ALLOWED_PDF,
            }}
            defaultFileName={infographic?.pdfFile?.url}
          />
        </FormControl>
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button variant="contained" color="primary" type="submit">
            {infographic ? "Sauvegarder" : "Créer"}
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
                    message: "L'infographie a été publiée",
                  });
                  setIsPublishing(false);
                } catch (e: any) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: `Erreur lors de la publication du document: ${e.message}`,
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

const ImagePreview: React.FC<{ file?: File; defaultValue?: string }> = ({
  file,
  defaultValue,
}) => {
  const [src, setSrc] = React.useState<string>();

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setSrc(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (defaultValue) {
      const url = `${buildFilePathUrl()}/${defaultValue}`;
      setSrc(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, defaultValue]);

  if (!src) return null;

  return (
    <Box mt={1} display="flex" justifyContent="center">
      <Image
        width={0}
        height={0}
        src={src}
        alt={"Preview de l'infographie"}
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
      />
    </Box>
  );
};
