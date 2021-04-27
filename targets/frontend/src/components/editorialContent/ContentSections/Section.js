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
import { SortableElement, sortableHandle } from "react-sortable-hoc";
import { Button, IconButton } from "src/components/button";
import { ReferenceBlocks } from "src/components/editorialContent/ReferenceBlocks";
import { FormErrorMessage } from "src/components/forms/ErrorMessage";
import { Stack } from "src/components/layout/Stack";
import { Li } from "src/components/list";
import { MarkdownLink } from "src/components/MarkdownLink";
import { Box, Container, Field, Flex, Label, Radio, Textarea } from "theme-ui";

import { MarkdownPreviewModal } from "./MarkdownPreviewModal";

export const TYPES = {
  GRAPHIC: "graphic",
  MARKDOWN: "markdown",
};

const DragHandle = sortableHandle(() => (
  <IconButton
    type="button"
    variant="secondary"
    sx={{ cursor: "grab", mt: "large" }}
  >
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
}) => {
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
                type="button"
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
                      value={TYPES.MARKDOWN}
                      defaultChecked={block.type === TYPES.MARKDOWN}
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
                      value={TYPES.GRAPHIC}
                      defaultChecked={block.type === TYPES.GRAPHIC}
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
                      <Button
                        type="button"
                        size="small"
                        onClick={() => remove(index)}
                      >
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
              {type === TYPES.GRAPHIC && (
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
