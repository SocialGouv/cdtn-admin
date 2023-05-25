import { Control, FieldPathValue } from "react-hook-form";
import { FieldPath } from "react-hook-form/dist/types";
import { FieldValues } from "react-hook-form/dist/types/fields";
import { RegisterOptions } from "react-hook-form/dist/types/validator";

export type CommonFormProps<
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
  control: Control<TFieldValues | any>;
  disabled?: boolean;
};
