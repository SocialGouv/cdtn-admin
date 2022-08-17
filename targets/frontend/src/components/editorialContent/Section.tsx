/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
// @ts-ignore
import { useFormContext } from "react-hook-form";
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
  blockIndex: number;
  name: string;
  numberOfBlocks: number;
  remove: any;
};

const RootSection = ({
  block,
  blockIndex: index,
  name,
  numberOfBlocks,
  remove,
}: SectionProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length) {
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
              <SectionBlocks key={index} name={`${name}.blocks`} />
              <div>
                <ReferenceBlocks name={`${name}.references`} />
              </div>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Li>
  );
};

export const SortableSection = SortableElement(React.memo(RootSection));
