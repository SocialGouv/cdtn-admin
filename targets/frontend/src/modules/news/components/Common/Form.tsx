import { AlertColor, FormControl, Stack } from "@mui/material";
import {
  FormDatePicker,
  FormEditionField,
  FormTextField,
} from "src/components/forms";

import { useForm } from "react-hook-form";
import { News } from "../../type";
import React, { useRef, useState } from "react";
import { SnackBar } from "src/components/utils/SnackBar";
import { zodResolver } from "@hookform/resolvers/zod";
import { request } from "src/lib/request";
import { LoadingButton } from "../../../../components/button/LoadingButton";
import { buildNewsFormSchema, NewsFormData } from "./formSchema";
import { NewsImageField } from "./NewsImageField";
import { NewsLinks } from "./NewsLinks";
import { NewsReferences } from "./NewsReferences";
import { getTodayInParis } from "src/modules/contribution/getTodayInParis";

type FormData = Partial<NewsFormData>;

export type FormDataResult = Required<
  Omit<News, "createdAt" | "updatedAt" | "publishedAt">
>;

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
  references: [],
  imageFile: null,
  imageAlt: "",
  imageAuthor: "",
  imageLicense: null,
  imageWidth: null,
  imageHeight: null,
  newImage: [],
};

export const NewsForm = ({
  news,
  onUpsert,
  onPublish,
}: Props): React.ReactElement => {
  const requireImage = !news || !!news.imageFile;
  const { control, handleSubmit, setValue, trigger, getValues } =
    useForm<FormData>({
      defaultValues: {
        ...defaultValues,
        ...news,
        displayDate: news?.displayDate ?? getTodayInParis(),
        imageAlt: news?.imageAlt ?? "",
        imageAuthor: news?.imageAuthor ?? "",
      },
      resolver: zodResolver(buildNewsFormSchema(requireImage)),
      shouldFocusError: true,
    });

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  // Verrou partagé par la sauvegarde et la publication : posé avant tout
  // `await` (validation comprise) pour qu'un double clic ne déclenche jamais
  // deux envois.
  const busyRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const onSubmit = async (newData: FormData): Promise<boolean> => {
    try {
      // L'id vient de l'actualité rechargée après chaque sauvegarde, pas du
      // formulaire : la ligne public.files est ainsi toujours mise à jour sur place.
      const savedImageId = news?.imageFile?.id ?? undefined;
      let imageFile = newData.imageFile
        ? { ...newData.imageFile, id: savedImageId }
        : null;
      let imageWidth = imageFile ? (newData.imageWidth ?? null) : null;
      let imageHeight = imageFile ? (newData.imageHeight ?? null) : null;
      const file = newData.newImage?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", newData.title!);
        const { key, width, height } = await request(
          "/api/storage/news-image",
          { body: fd }
        );
        imageFile = {
          id: savedImageId,
          url: key,
          size: `${file.size}`,
        };
        imageWidth = width;
        imageHeight = height;
      }
      await onUpsert({
        id: newData.id!,
        title: newData.title!,
        metaTitle: newData.metaTitle!,
        content: newData.content!,
        metaDescription: newData.metaDescription!,
        displayDate: newData.displayDate!,
        links: newData.links!,
        references: newData.references!,
        imageFile,
        imageAlt: newData.imageAlt || null,
        imageAuthor: newData.imageAuthor || null,
        imageLicense: newData.imageLicense ?? null,
        imageWidth,
        imageHeight,
      });
      setValue("imageFile", imageFile);
      setValue("imageWidth", imageWidth);
      setValue("imageHeight", imageHeight);
      setValue("newImage", []);
      setSnack({
        open: true,
        severity: "success",
        message: news
          ? "L'actualité a été modifiée avec succès"
          : "L'actualité a été créée avec succès",
      });
      return true;
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
      return false;
    }
  };

  const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setIsSaving(true);
    let saved = false;
    try {
      await handleSubmit(async (data) => {
        saved = await onSubmit(data);
      })(event);
    } finally {
      // À la création, la navigation vers l'actualité créée est en cours : on
      // garde le verrou pour ne pas pouvoir la créer une seconde fois.
      if (news || !saved) {
        busyRef.current = false;
        setIsSaving(false);
      }
    }
  };

  return (
    <form onSubmit={onFormSubmit}>
      <Stack spacing={4}>
        <FormControl>
          <FormDatePicker
            name="displayDate"
            control={control}
            label="Date mise à jour"
            hintText="Mise à jour automatiquement à chaque publication"
            disabled
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
          canRemove={!requireImage}
        />
        <NewsLinks control={control} />
        <NewsReferences control={control} />
        <Stack direction="row" spacing={2} justifyContent="end">
          <LoadingButton
            type="submit"
            color="primary"
            loading={isSaving}
            disabled={isPublishing}
          >
            {news ? "Sauvegarder" : "Créer"}
          </LoadingButton>
          {onPublish && (
            <LoadingButton
              loading={isPublishing}
              disabled={isSaving}
              onClick={async () => {
                if (busyRef.current) return;
                busyRef.current = true;
                setIsPublishing(true);
                try {
                  const valid = await trigger();
                  if (!valid) {
                    setSnack({
                      open: true,
                      severity: "error",
                      message:
                        "Corrigez les erreurs du formulaire avant de publier.",
                    });
                    return;
                  }
                  if (getValues("newImage")?.length) {
                    setSnack({
                      open: true,
                      severity: "error",
                      message: "Sauvegardez l'actualité avant de la publier.",
                    });
                    return;
                  }
                  await onPublish();
                  setValue("displayDate", getTodayInParis());
                  setSnack({
                    open: true,
                    severity: "success",
                    message: "L'actualité a été publiée",
                  });
                } catch (e: any) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: `Erreur lors de la publication du document: ${e.message}`,
                  });
                } finally {
                  busyRef.current = false;
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
