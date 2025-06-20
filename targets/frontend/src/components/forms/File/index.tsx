import React from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";
import Dropzone from "react-dropzone";
import { TitleBox } from "src/components/forms/TitleBox";
import { Chip, FormControl, FormHelperText, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { ALLOWED_DOC } from "src/lib/secu";

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
          <>
            <FormControl fullWidth={fullWidth} error={!!error}>
              <Dropzone
                accept={{
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    ALLOWED_DOC,
                }}
                noClick
                onDrop={(acceptedFiles) => {
                  onChange(acceptedFiles);
                  onFileChange &&
                    onFileChange(acceptedFiles[0] as unknown as DropzoneFile);
                }}
              >
                {({ getRootProps, getInputProps, open, isDragActive }) => (
                  <>
                    <TitleBox
                      title={label}
                      focus={isDragActive}
                      disabled={disabled}
                      isError={!!error}
                    >
                      <Container {...getRootProps()} onClick={open}>
                        <input
                          {...getInputProps({
                            id: "fileupload",
                            onChange,
                            onBlur,
                          })}
                        />

                        <Typography color={!!error ? "error" : "standard"}>
                          Sélectionnez un fichier ou glissez-le dans cette zone
                        </Typography>
                        {values && values.length > 0 ? (
                          <FileDetail label={values[0].name} color="success" />
                        ) : defaultFileName ? (
                          <FileDetail label={defaultFileName} color="success" />
                        ) : (
                          <FileDetail
                            label="Aucun fichier sélectionné"
                            color="warning"
                          />
                        )}
                      </Container>
                    </TitleBox>
                  </>
                )}
              </Dropzone>
            </FormControl>
            {error && (
              <StyledFormHelperText>{error.message}</StyledFormHelperText>
            )}
          </>
        );
      }}
    />
  );
};

const Container = styled("div")(() => {
  return {
    textAlign: "center",
  };
});

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => {
  return {
    color: theme.palette.error.main,
  };
});

const FileDetail = styled(Chip)(() => {
  return {
    margin: "1em",
  };
});
