import React from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";
import Dropzone from "react-dropzone";
import { TitleBox } from "src/components/forms/TitleBox";
import { Chip, Typography } from "@mui/material";

export type DropzoneFile = File & {
  path: string;
};
type FormFileFieldProps = CommonFormProps & {
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
}: FormFileFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, onBlur }, fieldState }) => (
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
            <TitleBox title={label} focus={isDragActive} disabled={disabled}>
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
                {acceptedFiles.length > 0 ? (
                  <Chip label={acceptedFiles[0].name} color="success" />
                ) : defaultFileName ? (
                  <Chip label={defaultFileName} color="success" />
                ) : (
                  <Chip label="Aucun fichier sélectionné" color="warning" />
                )}

                <div>
                  {fieldState.error && (
                    <span role="alert">{fieldState.error.message}</span>
                  )}
                </div>
              </div>
            </TitleBox>
          )}
        </Dropzone>
      )}
    />
  );
};

/*
<TextField
        helperText={
        error && error.type === "required" ? "Ce champ est requis" : null
      }
      size={size}
      error={!!error}
      onChange={onChange}
      value={value}
      fullWidth={fullWidth}
      label={label}
      variant="outlined"
      multiline={multiline}
      disabled={disabled}
      InputLabelProps={labelFixed ? {shrink: true} : {}}
    />
 */
