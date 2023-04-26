import { Alert, AlertColor, Button, Snackbar, TextField } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React, { PropsWithChildren, useState } from "react";
import { Control, Controller, FieldPathValue, useForm } from "react-hook-form";
import { FieldPath, UseFormReturn } from "react-hook-form/dist/types";
import { FieldValues } from "react-hook-form/dist/types/fields";
import { RegisterOptions } from "react-hook-form/dist/types/validator";

import { useQuestionUpdateMutation } from "./Question.mutation";
import { Question } from "./type";

export type EditQuestionProps = {
  question: Question;
};

export const EditQuestionForm = ({
  question,
}: EditQuestionProps): JSX.Element => {
  const form = useForm<Question>({
    defaultValues: question,
  });
  const updateQuestion = useQuestionUpdateMutation();

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const onSubmit = async (data: Question) => {
    try {
      const result = await updateQuestion(data);
      if (result.error) {
        setSnack({
          message: result.error.message,
          open: true,
          severity: "error",
        });
      } else {
        setSnack({ open: true, severity: "success" });
      }
    } catch (e) {
      setSnack({ open: true, severity: "error" });
    }
  };

  return (
    <>
      <Form form={form} onDataSubmit={onSubmit}>
        <Grid container spacing={2} columns={1} direction="column">
          <Grid>
            <FormTextField
              name="content"
              control={form.control}
              label="Nom de la question"
              rules={{ required: true }}
            />
          </Grid>
          <Grid display="flex" justifyContent="end">
            <Button variant="contained" type="submit">
              Sauvegarder
            </Button>
          </Grid>
        </Grid>
      </Form>
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ open: false })}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Alert
          onClose={() => setSnack({ open: false })}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack?.severity}
          {snack?.message ? `: ${snack.message}` : ""}
        </Alert>
      </Snackbar>
    </>
  );
};

type FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any
> = PropsWithChildren<{
  form: UseFormReturn<TFieldValues, TContext>;
  onDataSubmit: (values: TFieldValues) => void;
}> &
  React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
  >;

const Form = <TFieldValues extends FieldValues = FieldValues, TContext = any>({
  form,
  onDataSubmit,
  children,
  ...rest
}: FormProps<TFieldValues, TContext>): JSX.Element => {
  const { handleSubmit } = form;
  const onSubmit = async (data: TFieldValues) => {
    onDataSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} {...rest}>
      {children}
    </form>
  );
};

type FormTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName;
  label: string;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  shouldUnregister?: boolean;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  control?: Control<any, any>;
};

export const FormTextField = ({
  name,
  control,
  label,
  rules,
}: FormTextFieldProps) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextField
          helperText={
            error && error.type === "required" ? "Ce champ est requis" : null
          }
          size="small"
          error={!!error}
          onChange={onChange}
          value={value}
          fullWidth
          label={label}
          variant="outlined"
          multiline
        />
      )}
    />
  );
};
