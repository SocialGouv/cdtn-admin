import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import React from "react";
import { Controller } from "react-hook-form";
import { CommonFormProps } from "../type";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import fr from "date-fns/locale/fr";
import { format, parseISO } from "date-fns";

type FormDatePickerProps = CommonFormProps;

export const FormDatePicker = ({
  name,
  control,
  label,
  rules,
  disabled,
}: FormDatePickerProps) => {
  const formatDate = (date?: string | null) =>
    date ? new Date(format(parseISO(date.toString()), "dd/MM/yyyy")) : null;

  const unFormatDate = (date?: Date | null) =>
    date ? format(parseISO(date.toString()), "yyyy-MM-dd") : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <DatePicker
            label={label}
            value={formatDate(value)}
            onChange={(date) => onChange(unFormatDate(date))}
            disabled={disabled}
          />
        )}
      />
    </LocalizationProvider>
  );
};
