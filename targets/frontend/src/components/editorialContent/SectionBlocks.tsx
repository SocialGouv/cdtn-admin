import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { Box } from "@mui/material";

import { Button } from "../button";
import { SectionBlock } from "./SectionBlock";
import { theme } from "src/theme";

export type SectionBlockProps = {
  name: string;
};

export const SectionBlocks = ({ name }: SectionBlockProps) => {
  const { control } = useFormContext();
  const blocks = useWatch({
    control,
    name,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    keyName: "id",
    name,
  });
  return (
    <>
      {fields.map((item, index) => (
        <div key={`${name}.${index}`}>
          <SectionBlock
            name={`${name}.${index}`}
            remove={() => remove(index)}
            onlyBlock={blocks.length === 1}
          />
        </div>
      ))}
      <Box sx={{ mb: "1rem" }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          outline
          onClick={() => {
            append({ markdown: "", type: "markdown" });
          }}
        >
          <IoMdAdd
            style={{
              height: theme.sizes.iconSmall,
              marginRight: theme.space.xsmall,
              width: theme.sizes.iconSmall,
            }}
          />
          Ajouter un bloc d&apos;affichage
        </Button>
      </Box>
    </>
  );
};
