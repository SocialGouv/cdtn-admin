import React from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";
import Dropzone from "react-dropzone";
import { TitleBox } from "src/components/forms/TitleBox";
import { Chip, FormControl, FormHelperText, Typography } from "@mui/material";

export type DropzoneFile = File & {
  path: string;
};
type FormFileFieldProps = CommonFormProps & {
  fullWidth?: boolean;
  defaultFileName?: string;
  onFileChange?: (file: DropzoneFile | undefined) => void;
};

export const FormFileField = ({
  name,
  control,
  label,
  defaultFileName,
  rules,
  disabled,
  onFileChange,
  fullWidth,
}: FormFileFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => {
        const values = value as File[];
        return (
          <FormControl fullWidth={fullWidth} error={!!error}>
            <Dropzone
              accept={{
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              }}
              noClick
              onDrop={(acceptedFiles) => {
                onChange(acceptedFiles);
                onFileChange &&
                  onFileChange(acceptedFiles[0] as unknown as DropzoneFile);
              }}
            >
              {({
                getRootProps,
                getInputProps,
                open,
                isDragActive,
                acceptedFiles,
              }) => (
                <>
                  <TitleBox
                    title={label}
                    focus={isDragActive}
                    disabled={disabled}
                  >
                    <div
                      style={{
                        textAlign: "center",
                      }}
                      {...getRootProps()}
                      onClick={open}
                    >
                      <input
                        {...getInputProps({
                          id: "fileupload",
                          onChange,
                          onBlur,
                        })}
                      />

                      <Typography>
                        Sélectionnez un fichier ou glissez-le dans cette zone
                      </Typography>
                      {values && values.length > 0 ? (
                        <Chip label={values[0].name} color="success" />
                      ) : defaultFileName ? (
                        <Chip label={defaultFileName} color="success" />
                      ) : (
                        <Chip
                          label="Aucun fichier sélectionné"
                          color="warning"
                        />
                      )}
                    </div>
                  </TitleBox>
                  {error && error.type === "required" ? (
                    <FormHelperText>Un fichier est requis</FormHelperText>
                  ) : null}
                </>
              )}
            </Dropzone>
          </FormControl>
        );
      }}
    />
  );
};
