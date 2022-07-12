import { useFieldArray, useWatch } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { Divider } from "theme-ui";

import { Button } from "../button";
import { SectionBlock } from "./SectionBlock";

export type SectionBlockProps = {
  errors: any;
  register: any;
  name: string;
  control: any;
};

export const SectionBlocks = ({
  errors,
  register,
  name,
  control,
}: SectionBlockProps) => {
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
        <>
          <Divider />
          <SectionBlock
            key={index}
            errors={errors}
            register={register}
            name={`${name}.${index}`}
            control={control}
            remove={() => remove(index)}
            displayRemove={blocks.length > 1}
          />
        </>
      ))}
      <Divider />
      <div>
        <Button
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
          Ajouter un bloc d'affichage
        </Button>
      </div>
    </>
  );
};
