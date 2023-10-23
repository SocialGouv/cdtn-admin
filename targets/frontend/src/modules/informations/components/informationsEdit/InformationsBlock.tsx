import { Stack, IconButton } from "@mui/material";
import React from "react";
import { FormRadioGroup } from "src/components/forms";
import { Control, useWatch } from "react-hook-form";
import { styled } from "@mui/system";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";

import { InformationsBlockText } from "./InformationsBlockText";
import { InformationsBlockGraphic } from "./InformationsBlockGraphic";
import { InformationsBlockContent } from "./InformationsBlockContent";

export type InformationBlockProps = {
  name: string;
  control: Control<any>;
  first: boolean;
  last: boolean;
  onDown: () => void;
  onUp: () => void;
  onDelete: () => void;
};

export const InformationsBlock = ({
  name: blockName,
  control,
  first,
  last,
  onDown,
  onUp,
  onDelete,
}: InformationBlockProps): JSX.Element => {
  const blockType = useWatch({ name: `${blockName}.type`, control });
  const RenderBlock = (name: string, type?: string) => {
    switch (type) {
      case "graphic":
        return <InformationsBlockGraphic name={name} control={control} />;
      case "content":
        return <InformationsBlockContent name={name} control={control} />;
      default:
        return <InformationsBlockText name={name} control={control} />;
    }
  };

  return (
    <>
      <StyledBlock mt={4} spacing={2}>
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
        {blockType && (
          <FormRadioGroup
            name={`${blockName}.type`}
            label="Type"
            control={control}
            options={[
              {
                label: "Markdown",
                value: "markdown",
              },
              {
                label: "Graphique",
                value: "graphic",
              },
              {
                label: "Contenus",
                value: "content",
              },
            ]}
          />
        )}
        {RenderBlock(blockName, blockType)}
      </StyledBlock>
    </>
  );
};

const StyledBlock = styled(Stack)`
  border: 1px solid;
  padding: 12px;
`;
