import { Button, IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { TitleBox } from "../TitleBox";
import { FormTextField } from "../";
import { Control, useFieldArray } from "react-hook-form";

type OtherProps = {
  index: number;
  name: string;
  control: Control<any>;
  onDelete: () => void;
  disabled: boolean;
};

const OtherReferenceLine = ({
  index,
  name,
  control,
  onDelete,
  disabled,
}: OtherProps): React.ReactElement => {
  return (
    <Stack direction="row" spacing={2}>
      <FormTextField
        name={`${name}.${index}.label`}
        label="Nom"
        control={control}
        rules={{ required: true }}
        size="small"
        disabled={disabled}
      />
      <FormTextField
        name={`${name}.${index}.url`}
        label="Lien"
        control={control}
        size="small"
        fullWidth
        disabled={disabled}
      />
      {!disabled && (
        <IconButton aria-label="delete" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      )}
    </Stack>
  );
};

type Props = {
  name: string;
  control: Control<any>;
  disabled?: boolean;
};

export const FormOtherReferences = ({
  name,
  control,
  disabled = false,
}: Props): React.ReactElement => {
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  const onAdd = () => {
    append({
      label: "",
      url: "",
    });
  };

  return (
    <TitleBox title="Autres références" disabled={disabled}>
      <Stack spacing={2} mt={4}>
        {fields.map((field, index) => {
          return (
            <OtherReferenceLine
              key={field.id}
              name={name}
              control={control}
              index={index}
              onDelete={() => remove(index)}
              disabled={disabled}
            />
          );
        })}
        {!disabled && (
          <Button startIcon={<AddIcon />} size="small" onClick={onAdd}>
            Ajouter une référence
          </Button>
        )}
      </Stack>
    </TitleBox>
  );
};
