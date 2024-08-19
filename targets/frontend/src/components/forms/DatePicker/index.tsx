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
  const formatDate = (date?: string | null) => {
    try {
      if (date && date !== "") {
        const dateString = format(parseISO(date), "dd/MM/yyyy");
        const [day, month, year] = dateString.split("/").map(Number);
        const formattedDate = new Date(year, month - 1, day);
        return formattedDate;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const unFormatDate = (date?: Date | null) => {
    try {
      if (date) {
        return format(new Date(date.toString()), "yyyy-MM-dd");
      }
      return null;
    } catch (error) {
      return null;
    }
  };

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
            onChange={(date) => {
              onChange(unFormatDate(date));
            }}
            disabled={disabled}
          />
        )}
      />
    </LocalizationProvider>
  );
};
