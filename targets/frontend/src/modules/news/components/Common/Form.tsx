import { AlertColor, Button, FormControl, Stack } from "@mui/material";
import {
  FormDatePicker,
  FormEditionField,
  FormTextField,
} from "src/components/forms";

import { useForm } from "react-hook-form";
import { News } from "../../type";
import React, { useState } from "react";
import { SnackBar } from "src/components/utils/SnackBar";
import { zodResolver } from "@hookform/resolvers/zod";
import { request } from "src/lib/request";
import { LoadingButton } from "../../../../components/button/LoadingButton";
import { buildNewsFormSchema, NewsFormData } from "./formSchema";
import { NewsImageField } from "./NewsImageField";
import { NewsLinks } from "./NewsLinks";
import { NewsLegiReferences } from "./NewsLegiReferences";

type FormData = Partial<NewsFormData>;

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
  links: [],
  legiReferences: [],
  imageFile: null,
  imageAlt: "",
  imageAuthor: "",
  imageLicense: null,
  newImage: [],
};

export const NewsForm = ({
  news,
  onUpsert,
  onPublish,
}: Props): React.ReactElement => {
  const { control, handleSubmit, setValue } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      ...news,
      imageAlt: news?.imageAlt ?? "",
      imageAuthor: news?.imageAuthor ?? "",
    },
    resolver: zodResolver(buildNewsFormSchema(!news || !!news.imageFile)),
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
      // L'id vient de l'actualité rechargée après chaque sauvegarde, pas du
      // formulaire : la ligne public.files est ainsi toujours mise à jour sur place.
      const savedImageId = news?.imageFile?.id ?? undefined;
      let imageFile = newData.imageFile
        ? { ...newData.imageFile, id: savedImageId }
        : null;
      const file = newData.newImage?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", newData.title!);
        const { key } = await request("/api/storage/news-image", { body: fd });
        imageFile = {
          id: savedImageId,
          url: key,
          size: `${file.size}`,
        };
      }
      await onUpsert({
        id: newData.id!,
        title: newData.title!,
        metaTitle: newData.metaTitle!,
        content: newData.content!,
        metaDescription: newData.metaDescription!,
        displayDate: newData.displayDate!,
        links: newData.links!,
        legiReferences: newData.legiReferences!,
        imageFile,
        imageAlt: newData.imageAlt || null,
        imageAuthor: newData.imageAuthor || null,
        imageLicense: newData.imageLicense ?? null,
      });
      setValue("imageFile", imageFile);
      setValue("newImage", []);
      setSnack({
        open: true,
        severity: "success",
        message: news
          ? "L'actualité a été modifiée avec succès"
          : "L'actualité a été créée avec succès",
      });
    } catch (error) {
      console.error("Echec à la sauvegarde", error);
      const uploadError = error as { data?: { errorMessage?: string } };
      setSnack({
        open: true,
        severity: "error",
        message:
          uploadError?.data?.errorMessage ??
          "Une erreur est survenue lors de la sauvegarde de l'actualité",
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
        <NewsImageField
          control={control}
          setValue={setValue}
          savedFile={news?.imageFile ?? null}
        />
        <NewsLinks control={control} />
        <NewsLegiReferences control={control} />
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
