import {
  Stack,
  FormControl,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Button,
  Typography
} from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import { Control, useFieldArray, useWatch } from "react-hook-form";

import { Information } from "../../type";
import { FormRadioGroup, FormTextField } from "src/components/forms";
import { InformationsBlock } from "./InformationsBlock";
import { InformationsReference } from "./InformationsReference";

export type InformationBlockProps = {
  name: `contents.${number}`;
  control: Control<any>;
  expanded: boolean;
  expand: () => void;
  first: boolean;
  last: boolean;
  onDown: () => void;
  onUp: () => void;
  onDelete: () => void;
};

export const InformationsContent = ({
  name,
  control,
  expanded,
  expand,
  first,
  last,
  onDown,
  onUp,
  onDelete
}: InformationBlockProps): JSX.Element => {
  const title = useWatch({ name: `${name}.title`, control });
  const {
    fields: blocks,
    swap: swapBlock,
    remove: removeBlock
  } = useFieldArray<Information, `contents.${number}.blocks`>({
    control,
    name: `${name}.blocks`
  });
  const {
    fields: references,
    swap: swapReference,
    remove: removeReference,
    append: appendReference
  } = useFieldArray<Information, `contents.${number}.references`>({
    control,
    name: `${name}.references`
  });

  return (
    <>
      <StyledAccordion expanded={expanded}>
        <AccordionSummary
          expandIcon={
            <IconButton onClick={expand}>
              <ExpandMoreIcon />
            </IconButton>
          }
          aria-controls={name}
        >
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems="center"
            width="calc(100% - 40px)"
          >
            <div>{title}</div>
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
        </AccordionSummary>
        <AccordionDetails>
          <Stack mt={4} spacing={2}>
            <FormControl>
              <FormTextField
                name={`${name}.title`}
                control={control}
                label="Titre"
                labelFixed
              />
            </FormControl>
            <Typography variant="h6">Blocs</Typography>
            {blocks.map(({ id }, index) => (
              <InformationsBlock
                key={id}
                name={`${name}.blocks.${index}`}
                control={control}
                first={index === 0}
                last={index === blocks.length - 1}
                onDown={() => swapBlock(index, index + 1)}
                onUp={() => swapBlock(index, index - 1)}
                onDelete={() => {
                  removeBlock(index);
                }}
              ></InformationsBlock>
            ))}
            {blocks.filter((i) => i.type === "graphic").length === 0 && (
              <>
                <Typography variant="h6">References</Typography>
                {!!references.length && (
                  <FormRadioGroup
                    name={`${name}.referenceLabel`}
                    label="Libellé de référence"
                    control={control}
                    options={[
                      {
                        label: "Références juridiques",
                        value: "Références juridiques"
                      },
                      {
                        label: "Liens utiles",
                        value: "Liens utiles"
                      }
                    ]}
                  />
                )}
                {references.map(({ id }, index) => (
                  <InformationsReference
                    key={id}
                    name={`${name}.references.${index}`}
                    control={control}
                    first={index === 0}
                    last={index === references.length - 1}
                    onDown={() => swapReference(index, index + 1)}
                    onUp={() => swapReference(index, index - 1)}
                    onDelete={() => removeReference(index)}
                  ></InformationsReference>
                ))}
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() =>
                    appendReference({
                      title: "",
                      type: "external",
                      url: ""
                    })
                  }
                >
                  Ajouter une Référence
                </Button>
              </>
            )}
          </Stack>
        </AccordionDetails>
      </StyledAccordion>
    </>
  );
};

const StyledAccordion = styled(Accordion)`
  cursor: default;
  div {
    cursor: default;
  }
  .MuiAccordionSummary-expandIconWrapper {
    cursor: pointer;
  }
`;
