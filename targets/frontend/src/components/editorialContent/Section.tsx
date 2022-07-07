/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import {
  IoIosArrowDropdown,
  IoIosArrowDropup,
  IoIosReorder,
  IoMdTrash,
} from "react-icons/io";
// @ts-ignore
import { SortableElement, sortableHandle } from "react-sortable-hoc";
import { Box, Container, Field, Flex, Label, Radio, Textarea } from "theme-ui";

import { Button, IconButton } from "../button";
import { ReferenceBlocks } from "../editorialContent/ReferenceBlocks";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { Stack } from "../layout/Stack";
import { Li } from "../list";
import { MarkdownLink } from "../MarkdownLink";
import { MarkdownPreviewModal } from "./MarkdownPreviewModal";

const DragHandle = sortableHandle(() => (
  <IconButton variant="secondary" sx={{ cursor: "grab", mt: "large" }}>
    <IoIosReorder
      aria-label="Réordonner les sections"
      style={{ height: "3rem", width: "3rem" }}
    />
  </IconButton>
));

const RootSection = ({
  block,
  control,
  errors,
  blockIndex: index,
  name,
  numberOfBlocks,
  register,
  remove,
}: any) => {
  const [isOpen, setOpen] = useState(!block.title || numberOfBlocks === 1);
  const type = useWatch({
    control,
    defaultValue: block.type,
    name: `${name}.type`,
  });
  const markdown = useWatch({
    control,
    defaultValue: "",
    name: `${name}.markdown`,
  });

  useEffect(() => {
    if (errors) {
      setOpen(true);
    }
  }, [errors, setOpen]);

  return (
    <Li>
      <Container
        key={block.key}
        bg="highlight"
        sx={{ flex: "1 0 auto", mb: "medium", p: "small" }}
      >
        <Stack>
          <Flex
            sx={{
              alignItem: "flex-start",
              justifyContent: "space-between",
            }}
          >
            {numberOfBlocks > 1 && <DragHandle />}
            <Box mx="small" my="0" sx={{ flex: "1 0 auto" }}>
              <Field
                label="Titre de la section"
                defaultValue={block.title}
                {...register(`${name}.title`, {
                  required: {
                    message: "Le titre de la section est requis",
                    value: true,
                  },
                })}
              />
              <FormErrorMessage errors={errors} fieldName="title" />
            </Box>
            <Box mt="medium">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setOpen(!isOpen)}
              >
                {isOpen ? (
                  <IoIosArrowDropup
                    sx={{ height: "1.8rem", m: "0.25rem", width: "1.8rem" }}
                  />
                ) : (
                  <IoIosArrowDropdown
                    sx={{ height: "1.8rem", m: "0.25rem", width: "1.8rem" }}
                  />
                )}
              </Button>
            </Box>
          </Flex>
          <Box sx={{ display: isOpen ? "block" : "none" }}>
            <Stack>
              <div>
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
                      defaultChecked={block.type === "markdown"}
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
                      defaultChecked={block.type === "graphic"}
                      {...register(`${name}.type`, {
                        required: {
                          message: "Il faut choisir le type de section",
                          value: true,
                        },
                      })}
                    />
                  </Label>
                  {numberOfBlocks > 1 && (
                    <Flex sx={{ flex: "1 0 auto", justifyContent: "flex-end" }}>
                      <Button size="small" onClick={() => remove(index)}>
                        <IoMdTrash
                          sx={{
                            height: "iconSmall",
                            mr: "xsmall",
                            width: "iconSmall",
                          }}
                        />
                        Supprimer cette section
                      </Button>
                    </Flex>
                  )}
                </Flex>
                <FormErrorMessage errors={errors} fieldName="type" />
              </div>
              {type === "graphic" && (
                <>
                  <div>
                    <Field
                      label="Lien de l’image"
                      defaultValue={block.imgUrl}
                      {...register(`${name}.imgUrl`, {
                        required: {
                          message: "L’url de l’image est requise",
                          value: true,
                        },
                      })}
                    />
                    <FormErrorMessage errors={errors} fieldName="imgUrl" />
                  </div>
                  <div>
                    <Field
                      label="Brève description de l’image"
                      defaultValue={block.altText}
                      {...register(`${name}.altText`, {
                        required: {
                          message:
                            "La brève description de l’image est requise",
                          value: true,
                        },
                      })}
                    />
                    <FormErrorMessage errors={errors} fieldName="altText" />
                  </div>
                  <div>
                    <Field
                      label="Lien du pdf"
                      defaultValue={block.fileUrl}
                      {...register(`${name}.fileUrl`, {
                        required: {
                          message: "L’url du pdf est requise",
                          value: true,
                        },
                      })}
                    />
                    <FormErrorMessage errors={errors} fieldName="fileUrl" />
                  </div>
                  <div>
                    <Field
                      label="Taille du pdf"
                      defaultValue={block.size}
                      {...register(`${name}.size`, {
                        required: {
                          message: "La taille du pdf est requise",
                          value: true,
                        },
                      })}
                    />
                    <FormErrorMessage errors={errors} fieldName="size" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor={"markdown"}>
                  Texte&nbsp;
                  <MarkdownLink />
                </Label>
                <Textarea
                  id={`${name}.markdown`}
                  rows={10}
                  defaultValue={block.markdown}
                  {...register(`${name}.markdown`, {
                    required: {
                      message: "Ce champ est requis",
                      value: true,
                    },
                  })}
                />
                <FormErrorMessage errors={errors} fieldName="markdown" />
                {markdown && <MarkdownPreviewModal markdown={markdown} />}
              </div>
              <div>
                <ReferenceBlocks
                  control={control}
                  register={register}
                  name={`${name}.references`}
                  errors={errors}
                />
              </div>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Li>
  );
};

export const SortableSection = SortableElement(React.memo(RootSection));

RootSection.propTypes = {
  block: PropTypes.object.isRequired,
  blockIndex: PropTypes.number.isRequired,
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  name: PropTypes.string.isRequired,
  numberOfBlocks: PropTypes.number.isRequired,
  register: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};
