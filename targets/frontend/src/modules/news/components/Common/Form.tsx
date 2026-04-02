import { AlertColor, Button, FormControl, Stack } from "@mui/material";
import {
  FormCdtnReferences,
  FormDatePicker,
  FormEditionField,
  FormTextField,
} from "src/components/forms";

import { useForm } from "react-hook-form";
import { News, newsSchema } from "../../type";
import React, { useState } from "react";
import { SnackBar } from "src/components/utils/SnackBar";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingButton } from "../../../../components/button/LoadingButton";

type FormData = Partial<z.infer<typeof newsSchemaInsert>>;

export type FormDataResult = Required<Omit<News, "createdAt" | "updatedAt">>;

type Props = {
  news?: News;
  onUpsert: (props: FormDataResult) => Promise<void>;
  onPublish?: () => Promise<void>;
};

const defaultValues: FormData = {
  title: "",
  metaTitle: "",
  content: "",
  metaDescription: "",
  cdtnReferences: [],
};

export const newsSchemaInsert = newsSchema.omit({
  updatedAt: true,
  createdAt: true,
});

export const newsSchemaUpdate = newsSchema.omit({
  updatedAt: true,
  createdAt: true,
});

export const NewsForm = ({
  news,
  onUpsert,
  onPublish,
}: Props): React.ReactElement => {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      ...news,
    },
    resolver: zodResolver(news ? newsSchemaUpdate : newsSchemaInsert),
    shouldFocusError: true,
  });

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const onSubmit = async (newData: FormData) => {
    try {
      await onUpsert({
        id: newData.id!,
        title: newData.title!,
        metaTitle: newData.metaTitle!,
        content: newData.content!,
        metaDescription: newData.metaDescription!,
        displayDate: newData.displayDate!,
        cdtnReferences: newData.cdtnReferences!,
      });
      setSnack({
        open: true,
        severity: "success",
        message: news
          ? "L'actualité a été modifiée avec succès"
          : "L'actualité a été créée avec succès",
      });
    } catch (error) {
      console.error("Echec à la sauvegarde", error);
      setSnack({
        open: true,
        severity: "error",
        message: "Une erreur est survenue lors de la sauvegarde de l'actualité",
      });
    }
  };

  const [isPublishing, setIsPublishing] = useState(false);

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
          <FormEditionField label="Contenu" name="content" control={control} />
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
          <FormCdtnReferences name="cdtnReferences" control={control} />
        </FormControl>
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button variant="contained" color="primary" type="submit">
            {news ? "Sauvegarder" : "Créer"}
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
                    message: "L'actualité a été publiée",
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
