import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { Divider } from "@mui/material";

import { Button } from "../button";
import { SectionBlock } from "./SectionBlock";

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
          <Divider />
          <SectionBlock
            name={`${name}.${index}`}
            remove={() => remove(index)}
            onlyBlock={blocks.length === 1}
          />
        </div>
      ))}
      <Divider />
      <div>
        <Button
          type="button"
          size="small"
          variant="secondary"
          outline
          onClick={() => {
            append({ markdown: "", type: "markdown" });
          }}
        >
          <IoMdAdd
            sx={{
              height: "iconSmall",

              mr: "xsmall",
              width: "iconSmall",
            }}
          />
          Ajouter un bloc d&apos;affichage
        </Button>
      </div>
    </>
  );
};
