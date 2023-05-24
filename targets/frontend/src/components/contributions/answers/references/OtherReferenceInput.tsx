import { Box, Button, IconButton, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { TitleBox } from "../../../forms/TitleBox";
import { FormTextField } from "../../../forms";
import { Control, useFieldArray } from "react-hook-form";
import styled, { css } from "styled-components";

type OtherProps = {
  index: number;
  name: string;
  control: Control<any>;
  onDelete: () => void;
};

const OtherReferenceLine = ({
  index,
  name,
  control,
  onDelete,
}: OtherProps): React.ReactElement => {
  return (
    <Stack direction="row" spacing={2}>
      <FormTextField
        name={`${name}.${index}.label`}
        label="Nom"
        control={control}
        rules={{ required: true }}
        size="small"
      />
      <FormTextField
        name={`${name}.${index}.url`}
        label="Lien"
        control={control}
        size="small"
        fullWidth
      />
      <IconButton aria-label="delete" onClick={onDelete}>
        <DeleteIcon />
      </IconButton>
    </Stack>
  );
};

type Props = {
  name: string;
  control: Control<any>;
};

export const OtherReferenceInput = ({
  name,
  control,
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
    <TitleBox title="Autres références">
      <StyledStack spacing={2}>
        {fields.map((field, index) => {
          return (
            <OtherReferenceLine
              key={field.id}
              name={name}
              control={control}
              index={index}
              onDelete={() => remove(index)}
            />
          );
        })}
        <Button startIcon={<AddIcon />} size="small" onClick={onAdd}>
          Ajouter une référence
        </Button>
      </StyledStack>
    </TitleBox>
  );
};

const StyledStack = styled(Stack)`
  margin-top: 16px;
`;
