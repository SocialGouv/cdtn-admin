import React, { useEffect, useState } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import Dropzone from "react-dropzone";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  Stack,
  Typography,
} from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { TitleBox } from "src/components/forms/TitleBox";
import { FormRadioGroup, FormTextField } from "src/components/forms";
import { buildFilePathUrl } from "src/components/utils";
import { Delete } from "src/components/utils/dsfrIcons";
import {
  checkNewsImage,
  NEWS_IMAGE_ACCEPT,
  NEWS_IMAGE_ALT_ADVISED_LENGTH,
  readImageDimensions,
} from "../../image";
import { NewsImageFile } from "../../type";

type Props = {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  savedFile: NewsImageFile | null;
  canRemove: boolean;
};

export const NewsImageField = ({
  control,
  setValue,
  savedFile,
  canRemove,
}: Props) => {
  const [rejection, setRejection] = useState<string>();
  const [warning, setWarning] = useState<string>();
  const alt: string | null | undefined = useWatch({
    control,
    name: "imageAlt",
  });

  const onDrop = async ([file]: File[]) => {
    if (!file) return;
    let dimensions: { width: number; height: number };
    try {
      dimensions = await readImageDimensions(file);
    } catch (e) {
      setRejection(e instanceof Error ? e.message : String(e));
      setValue("newImage", []);
      setWarning(undefined);
      return;
    }
    const { width, height } = dimensions;
    const check = checkNewsImage({
      type: file.type,
      size: file.size,
      width,
      height,
    });
    if (check.errors.length) {
      setRejection(check.errors.join(" "));
      setValue("newImage", []);
      setWarning(undefined);
    } else {
      setRejection(undefined);
      setValue("newImage", [file], { shouldValidate: true });
      setWarning(check.warning);
    }
  };

  return (
    <TitleBox title="Image de l'actualité">
      <Stack direction={{ xs: "column", md: "row" }} spacing={4} mt={1}>
        <Box flex={1}>
          <Controller
            name="newImage"
            control={control}
            render={({ field: { value }, fieldState: { error } }) => {
              const newImage = (value ?? []) as File[];
              return (
                <FormControl fullWidth error={!!error || !!rejection}>
                  <Dropzone
                    accept={NEWS_IMAGE_ACCEPT}
                    multiple={false}
                    noClick
                    onDrop={(acceptedFiles) => onDrop(acceptedFiles)}
                    onDropRejected={(rejections) =>
                      setRejection(
                        `Format non accepté (${
                          rejections[0]?.file.type || "inconnu"
                        }). Formats attendus : WebP, JPEG ou PNG.`
                      )
                    }
                  >
                    {({ getRootProps, getInputProps, open, isDragActive }) => (
                      <Box
                        {...getRootProps()}
                        onClick={open}
                        p={2}
                        textAlign="center"
                        sx={{
                          cursor: "pointer",
                          border: `1px dashed ${
                            error || rejection
                              ? fr.colors.decisions.border.plain.error.default
                              : isDragActive
                                ? fr.colors.decisions.border.active.blueFrance
                                    .default
                                : fr.colors.decisions.border.default.grey
                                    .default
                          }`,
                        }}
                      >
                        <input {...getInputProps({ id: "newsImageUpload" })} />
                        <Typography>
                          Sélectionnez un fichier ou glissez-le dans cette zone
                        </Typography>
                        {(newImage[0] || savedFile) && (
                          <Chip
                            sx={{ margin: "1em" }}
                            color="success"
                            variant="outlined"
                            label={
                              newImage[0]?.name ??
                              savedFile?.url.split("/").pop()
                            }
                          />
                        )}
                        <NewsImagePreview
                          file={newImage[0]}
                          defaultValue={savedFile?.url}
                        />
                      </Box>
                    )}
                  </Dropzone>
                  <FormHelperText>
                    WebP, JPEG, PNG · 16:9 exact · min. 1200 px · max. 5 Mo.
                    Idéal : 1600 × 900, moins de 300 Ko.
                  </FormHelperText>
                  {rejection && (
                    <FormHelperText error>{rejection}</FormHelperText>
                  )}
                  {error?.message && (
                    <FormHelperText error>{error.message}</FormHelperText>
                  )}
                  {warning && (
                    <FormHelperText
                      sx={{
                        color: fr.colors.decisions.text.default.warning.default,
                      }}
                    >
                      {warning}
                    </FormHelperText>
                  )}
                  {(newImage.length > 0 || savedFile) && (
                    <Box mt={1}>
                      <Button
                        variant="outlined"
                        startIcon={<Delete />}
                        disabled={!canRemove && !newImage.length}
                        title={
                          !canRemove && !newImage.length
                            ? "L'image est obligatoire : remplacez-la en déposant un nouveau fichier."
                            : undefined
                        }
                        onClick={() => {
                          const hadNewImage = newImage.length > 0;
                          setValue("newImage", []);
                          if (!hadNewImage) {
                            setValue("imageFile", null, { shouldDirty: true });
                          }
                          setWarning(undefined);
                        }}
                      >
                        Supprimer l&apos;image
                      </Button>
                    </Box>
                  )}
                </FormControl>
              );
            }}
          />
        </Box>
        <Stack flex={1} spacing={2}>
          <FormControl>
            <FormTextField
              name="imageAlt"
              control={control}
              label="Texte alternatif"
              multiline
              fullWidth
              hintText={`${
                (alt ?? "").length
              }/${NEWS_IMAGE_ALT_ADVISED_LENGTH} caractères conseillés. Décrivez l'image sans écrire « image de ».`}
            />
          </FormControl>
          <FormRadioGroup
            name="imageLicense"
            control={control}
            label="Droits d'utilisation"
            options={[
              { label: "Libre de droit", value: "free" },
              { label: "Source à indiquer", value: "source" },
            ]}
          />
          <Controller
            name="imageLicense"
            control={control}
            render={({ fieldState: { error } }) =>
              error?.message ? (
                <FormHelperText error>{error.message}</FormHelperText>
              ) : (
                <></>
              )
            }
          />
          <FormControl>
            <FormTextField
              name="imageAuthor"
              control={control}
              label="Auteur ou source"
              fullWidth
              hintText="Un nom ou l'adresse d'un site web."
            />
          </FormControl>
        </Stack>
      </Stack>
    </TitleBox>
  );
};

const NewsImagePreview: React.FC<{ file?: File; defaultValue?: string }> = ({
  file,
  defaultValue,
}) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
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
    } else {
      setSrc(undefined);
    }
  }, [file, defaultValue]);

  return (
    <Box
      mt={1}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        aspectRatio: "16 / 9",
        width: "100%",
        overflow: "hidden",
        backgroundColor: fr.colors.decisions.background.contrast.grey.default,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt="Aperçu de l'image de l'actualité"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Typography color="text.secondary">aperçu 16:9</Typography>
      )}
    </Box>
  );
};
