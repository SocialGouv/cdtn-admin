import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { IoMdTrash } from "react-icons/io";

import { Button } from "../button";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { SectionContent } from "./SectionContent";
import { SectionImage } from "./SectionImage";
import { SectionText } from "./SectionText";
import Box from "@mui/material/Box";
import { FormRadioGroup } from "../forms";

export type SectionBlockProps = {
  name: string;
  remove: any;
  onlyBlock: boolean;
};

export const SectionBlock = ({
  name,
  remove,
  onlyBlock,
}: SectionBlockProps) => {
  let block;
  const {
    control,
    register,
    formState: { errors },
    setValue,
  } = useFormContext();
  const type = useWatch({
    control,
    defaultValue: "markdown",
    name: `${name}.type`,
  });
  switch (type) {
    case "graphic":
      block = <SectionImage name={name} />;
      break;
    case "content":
      block = <SectionContent name={name} />;
      break;
    case "markdown":
    default:
      block = <SectionText name={name} />;
      break;
  }
  useEffect(() => {
    switch (type) {
      case "content":
        setValue(`${name}.markdown`, undefined);
        setValue(`${name}.imgUrl`, undefined);
        setValue(`${name}.altText`, undefined);
        setValue(`${name}.fileUrl`, undefined);
        setValue(`${name}.size`, undefined);
        break;
      case "graphic":
        setValue(`${name}.contents`, undefined);
        break;
      case "markdown":
      default:
        setValue(`${name}.contents`, undefined);
        setValue(`${name}.imgUrl`, undefined);
        setValue(`${name}.altText`, undefined);
        setValue(`${name}.fileUrl`, undefined);
        setValue(`${name}.size`, undefined);
    }
  }, [type, setValue, name]);
  return (
    <Box
      sx={{
        padding: "12px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FormRadioGroup
          name={`${name}.type`}
          label="Type de réponse"
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
        {!onlyBlock && (
          <Button type="button" size="small" onClick={remove}>
            <IoMdTrash
              style={{
                height: "1.5rem",
                marginRight: "0.8rem",
                width: "1.5rem",
              }}
            />
            Supprimer cet affichage
          </Button>
        )}
      </Box>
      <FormErrorMessage errors={errors} fieldName="type" />
      {block}
    </Box>
  );
};
