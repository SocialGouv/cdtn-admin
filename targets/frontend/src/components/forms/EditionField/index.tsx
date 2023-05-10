import React from "react";
import { Controller } from "react-hook-form";

import { CommonFormProps } from "../type";
import { Editor } from "./Editor";

type FormEditionProps = CommonFormProps;

export const FormEditionField = (props: FormEditionProps) => {
  return (
    <Controller
      name={props.name}
      control={props.control}
      rules={props.rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <>
          <Editor onUpdate={onChange} content={value} />
          {error && <span style={{ color: "red" }}>{error?.message}</span>}
        </>
      )}
    />
  );
};
