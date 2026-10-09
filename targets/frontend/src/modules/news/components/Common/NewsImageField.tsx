import React, { useEffect, useState } from "react";
import {
  Control,
  Controller,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import Dropzone from "react-dropzone";
import Image from "next/image";
import {
  Box,
  Button,
  Chip,
  FormControl,
  FormHelperText,
  Stack,
  Typography,
} from "@mui/material";
import { TitleBox } from "src/components/forms/TitleBox";
import { FormRadioGroup, FormTextField } from "src/components/forms";
import { buildFilePathUrl } from "src/components/utils";
import {
  checkNewsImage,
  NEWS_IMAGE_ACCEPT,
  NEWS_IMAGE_ALT_ADVISED_LENGTH,
  readImageDimensions,
} from "../../image";
import { NewsImageFile } from "../../type";

const FORMAT_ERROR =
  "Format non accepté. Formats attendus : WebP, JPEG ou PNG.";

type Props = {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  savedFile: NewsImageFile | null;
};

export const NewsImageField = ({ control, setValue, savedFile }: Props) => {
  const [rejection, setRejection] = useState<string>();
  const [warning, setWarning] = useState<string>();
  const alt: string | null | undefined = useWatch({
    control,
    name: "imageAlt",
  });

  const onDrop = async ([file]: File[]) => {
    if (!file) return;
    const { width, height } = await readImageDimensions(file);
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
                    onDropRejected={() => setRejection(FORMAT_ERROR)}
                  >
                    {({ getRootProps, getInputProps, open, isDragActive }) => (
                      <TitleBox
                        title="Fichier"
                        focus={isDragActive}
                        isError={!!error || !!rejection}
                      >
                        <Box
                          {...getRootProps()}
                          onClick={open}
                          textAlign="center"
                        >
                          <input
                            {...getInputProps({ id: "newsImageUpload" })}
                          />
                          <Typography>
                            Sélectionnez un fichier ou glissez-le dans cette
                            zone
                          </Typography>
                          {newImage[0] || savedFile ? (
                            <Chip
                              sx={{ margin: "1em" }}
                              color="success"
                              label={newImage[0]?.name ?? savedFile?.url}
                            />
                          ) : (
                            <Chip
                              sx={{ margin: "1em" }}
                              color="warning"
                              label="Aucun fichier sélectionné"
                            />
                          )}
                          <NewsImagePreview
                            file={newImage[0]}
                            defaultValue={savedFile?.url}
                          />
                        </Box>
                      </TitleBox>
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
                    <Typography variant="body2" color="warning.main">
                      {warning}
                    </Typography>
                  )}
                  {newImage.length > 0 && (
                    <Box mt={1}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setValue("newImage", []);
                          setWarning(undefined);
                        }}
                      >
                        Retirer le fichier sélectionné
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
    }
  }, [file, defaultValue]);

  if (!src) return null;

  return (
    <Box mt={1} display="flex" justifyContent="center">
      <Image
        width={0}
        height={0}
        src={src}
        alt="Aperçu de l'image de l'actualité"
        sizes="100vw"
        unoptimized
        style={{ width: "100%", height: "auto" }}
      />
    </Box>
  );
};
