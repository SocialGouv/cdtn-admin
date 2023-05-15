import React, { useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { IoMdTrash } from "react-icons/io";
import { Container, Flex, Label, Radio } from "theme-ui";

import { Button } from "../button";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { SectionContent } from "./SectionContent";
import { SectionImage } from "./SectionImage";
import { SectionText } from "./SectionText";

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
    <>
      <Container
        sx={{
          padding: "12px",
        }}
      >
        <Flex sx={{ display: "flex" }}>
          <Flex sx={{ justifyContent: "flex-start" }}>
            <Label
              sx={{
                alignItems: "center",
                cursor: "pointer",
                flex: "0 1 auto",
                justifyContent: "flex-start",
                mr: "large",
                width: "auto",
              }}
            >
              Markdown{" "}
              <Radio
                sx={{ ml: "xxsmall" }}
                value={"markdown"}
                {...register(`${name}.type`, {
                  required: {
                    message: "Il faut choisir le type de section",
                    value: true,
                  },
                })}
              />
            </Label>
            <Label
              sx={{
                alignItems: "center",
                cursor: "pointer",
                flex: "0 1 auto",
                justifyContent: "flex-center",
                mr: "large",
                width: "auto",
              }}
            >
              Graphique{" "}
              <Radio
                ml="xxsmall"
                value={"graphic"}
                {...register(`${name}.type`, {
                  required: {
                    message: "Il faut choisir le type de section",
                    value: true,
                  },
                })}
              />
            </Label>
            <Label
              sx={{
                alignItems: "center",
                cursor: "pointer",
                flex: "0 1 auto",
                justifyContent: "flex-center",
                mr: "large",
                width: "auto",
              }}
            >
              Contenus{" "}
              <Radio
                ml="xxsmall"
                value={"content"}
                {...register(`${name}.type`, {
                  required: {
                    message: "Il faut choisir le type de section",
                    value: true,
                  },
                })}
              />
            </Label>
          </Flex>
          {!onlyBlock && (
            <Flex
              sx={{
                display: "flex",
                flex: 1,
                justifyContent: "flex-end",
                margin: "0 3px",
              }}
            >
              <Button type="button" size="small" onClick={remove}>
                <IoMdTrash
                  sx={{
                    height: "1.5rem",
                    marginRight: "0.8rem",
                    mr: "xsmall",
                    width: "1.5rem",
                  }}
                />
                Supprimer cet affichage
              </Button>
            </Flex>
          )}
        </Flex>
        <FormErrorMessage errors={errors} fieldName="type" />
        {block}
      </Container>
    </>
  );
};
