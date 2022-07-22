import React from "react";
import { useWatch } from "react-hook-form";
import { IoMdTrash } from "react-icons/io";
import { Container, Flex, Label, Radio } from "theme-ui";

import { Button } from "../button";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { SectionImage } from "./SectionImage";
import { SectionText } from "./SectionText";

export type SectionBlockProps = {
  errors: any;
  register: any;
  name: string;
  control: any;
  remove: any;
  onlyBlock: boolean;
};

export const SectionBlock = ({
  errors,
  register,
  name,
  control,
  remove,
  onlyBlock,
}: SectionBlockProps) => {
  let block;
  const type = useWatch({
    control,
    defaultValue: "markdown",
    name: `${name}.type`,
  });
  switch (type) {
    case "graphic":
      block = (
        <SectionImage
          errors={errors}
          register={register}
          name={name}
          control={control}
        />
      );
      break;
    case "markdown":
    default:
      block = (
        <SectionText
          errors={errors}
          register={register}
          name={name}
          control={control}
        />
      );
      break;
  }
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
              Mardown{" "}
              <Radio
                sx={{ ml: "xxsmall" }}
                value={"markdown"}
                name={name}
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
                width: "auto",
              }}
            >
              Graphique{" "}
              <Radio
                ml="xxsmall"
                value={"graphic"}
                name={name}
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
              <Button size="small" onClick={remove}>
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
