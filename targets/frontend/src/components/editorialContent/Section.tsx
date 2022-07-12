/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import {
  IoIosArrowDropdown,
  IoIosArrowDropup,
  IoIosReorder,
  IoMdTrash,
} from "react-icons/io";
// @ts-ignore
import { SortableElement, sortableHandle } from "react-sortable-hoc";
import { Box, Container, Field, Flex } from "theme-ui";

import { ContentSection } from "../../types";
import { Button, IconButton } from "../button";
import { ReferenceBlocks } from "../editorialContent/ReferenceBlocks";
import { FormErrorMessage } from "../forms/ErrorMessage";
import { Stack } from "../layout/Stack";
import { Li } from "../list";
import { SectionBlocks } from "./SectionBlocks";

const DragHandle = sortableHandle(() => (
  <IconButton variant="secondary" sx={{ cursor: "grab", mt: "large" }}>
    <IoIosReorder
      aria-label="Réordonner les sections"
      style={{ height: "3rem", width: "3rem" }}
    />
  </IconButton>
));

type SectionProps = {
  block: ContentSection;
  control: any;
  errors: any[];
  blockIndex: number;
  name: string;
  numberOfBlocks: number;
  register: any;
  remove: any;
};

const RootSection = ({
  block,
  control,
  errors,
  blockIndex: index,
  name,
  numberOfBlocks,
  register,
  remove,
}: SectionProps) => {
  const [isOpen, setOpen] = useState(!block.title || numberOfBlocks === 1);

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
                <Flex
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    margin: "0 3px",
                  }}
                >
                  {numberOfBlocks > 1 && (
                    <Flex
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        margin: "0 3px",
                      }}
                    >
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
              </div>
              <SectionBlocks
                key={index}
                errors={errors}
                register={register}
                name={`${name}.blocks`}
                control={control}
              />
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
