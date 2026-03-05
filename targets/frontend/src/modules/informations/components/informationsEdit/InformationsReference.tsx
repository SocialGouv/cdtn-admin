import { Stack, IconButton, FormControl } from "@mui/material";
import React from "react";
import { FormTextField } from "src/components/forms";
import { Control } from "react-hook-form";
import { styled } from "@mui/material/styles";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
} from "src/components/utils/dsfrIcons";

export type InformationsReferenceProps = {
  name: string;
  control: Control<any>;
  first: boolean;
  last: boolean;
  onDown: () => void;
  onUp: () => void;
  onDelete: () => void;
};

export const InformationsReference = ({
  name,
  control,
  first,
  last,
  onDown,
  onUp,
  onDelete,
}: InformationsReferenceProps): JSX.Element => {
  return (
    <>
      <StyledReference
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <Stack direction={"row"} justifyContent={"end"} width="100%">
          <Stack direction={"row"}>
            <IconButton disabled={first} onClick={onUp}>
              <ArrowUpwardIcon />
            </IconButton>
            <IconButton disabled={last} onClick={onDown}>
              <ArrowDownwardIcon />
            </IconButton>
            <IconButton>
              <DeleteIcon onClick={onDelete} />
            </IconButton>
          </Stack>
        </Stack>
        <FormControl>
          <FormTextField
            name={`${name}.title`}
            control={control}
            label="Titre"
            rules={{ required: true }}
            fullWidth
            labelFixed
          />
        </FormControl>
        <FormControl>
          <FormTextField
            name={`${name}.url`}
            control={control}
            label="Url"
            rules={{ required: true }}
            fullWidth
            labelFixed
          />
        </FormControl>
      </StyledReference>
    </>
  );
};

const StyledReference = styled(Stack)`
  border: 1px solid;
  padding: 12px;
`;
