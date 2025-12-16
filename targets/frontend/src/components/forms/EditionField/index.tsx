import React from "react";
import { FormHelperText } from "@mui/material";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";
import { Editor } from "./Editor";
import { styled } from "@mui/system";
import { buildFilePathUrl } from "../../utils";

type FormEditionProps = CommonFormProps & {
  infographicEnabled?: boolean;
  onInfographicChange?: (id: string, state: "added" | "deleted") => void;
};

export const FormEditionField = ({
  name,
  control,
  rules,
  label,
  disabled,
  infographicEnabled = false,
  onInfographicChange,
}: FormEditionProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <Editor
            label={label}
            onUpdate={onChange}
            content={value}
            disabled={disabled}
            infographicBaseUrl={buildFilePathUrl()}
            isError={!!error}
            infographicEnabled={infographicEnabled}
            onInfographicChange={onInfographicChange}
          />
          {error && (
            <StyledFormHelperText>{error.message}</StyledFormHelperText>
          )}
        </>
      )}
    />
  );
};

const StyledFormHelperText = styled(FormHelperText)(({ theme }) => {
  return {
    color: theme.palette.error.main,
  };
});
