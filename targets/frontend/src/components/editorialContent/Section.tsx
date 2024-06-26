import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  IoIosArrowDropdown,
  IoIosArrowDropup,
  IoIosReorder,
  IoMdTrash,
} from "react-icons/io";
// @ts-ignore
import { SortableElement, sortableHandle } from "react-sortable-hoc";

import { ContentSection } from "../../types";
import { Button, IconButton } from "../button";
import { ReferenceBlocks } from "./ReferenceBlocks";
import { Li } from "../list";
import { SectionBlocks } from "./SectionBlocks";
import { FormTextField } from "../forms";
import { Card, CardContent, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { theme } from "src/theme";

const DragHandle = sortableHandle(() => (
  <IconButton variant="outlined" sx={{ cursor: "grab" }}>
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
  open: boolean;
};

const RootSection = ({
  block,
  blockIndex: index,
  name,
  numberOfBlocks,
  remove,
  open = true,
}: SectionProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [isOpen, setOpen] = useState(open);

  useEffect(() => {
    if (Object.keys(errors).length) {
      setOpen(true);
    }
  }, [errors, setOpen]);

  return (
    <Li>
      <Card
        key={block.key}
        sx={{
          mt: "1rem",
          mb: "1rem",
        }}
      >
        <CardContent
          sx={{
            mt: "1rem",
            mb: "1rem",
          }}
        >
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            {numberOfBlocks > 1 && <DragHandle />}

            <FormTextField
              name={`${name}.title`}
              fullWidth
              multiline
              label="Titre de la section"
              control={control}
              rules={{ required: true }}
            />

            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={() => setOpen(!isOpen)}
            >
              {isOpen ? (
                <IoIosArrowDropup
                  style={{
                    height: "1.8rem",
                    margin: "0.25rem",
                    width: "1.8rem",
                  }}
                />
              ) : (
                <IoIosArrowDropdown
                  style={{
                    height: "1.8rem",
                    margin: "0.25rem",
                    width: "1.8rem",
                  }}
                />
              )}
            </Button>
          </Stack>
          <Box sx={{ display: isOpen ? "block" : "none" }}>
            <Stack>
              {numberOfBlocks > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: "1rem",
                    mb: "1rem",
                  }}
                >
                  <Button
                    type="button"
                    size="small"
                    onClick={() => remove(index)}
                    color="error"
                  >
                    <IoMdTrash
                      style={{
                        height: theme.sizes.iconSmall,
                        marginRight: theme.space.xsmall,
                        width: theme.sizes.iconSmall,
                      }}
                    />
                    Supprimer cette section
                  </Button>
                </Box>
              )}

              <SectionBlocks key={index} name={`${name}.blocks`} />
              <div>
                <ReferenceBlocks name={`${name}.references`} />
              </div>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Li>
  );
};

export const SortableSection = SortableElement(React.memo(RootSection));
