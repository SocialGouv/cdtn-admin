import React from "react";
import { FormHelperText } from "@mui/material";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";
import { Editor } from "./Editor";
import { styled } from "@mui/system";

type FormEditionProps = CommonFormProps;

export const FormEditionField = (props: FormEditionProps) => {
  return (
    <Controller
      name={props.name}
      control={props.control}
      rules={props.rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <Editor
            onUpdate={onChange}
            content={value}
            disabled={props.disabled}
            isError={!!error}
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
