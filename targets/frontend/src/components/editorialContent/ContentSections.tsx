import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IoMdAdd } from "react-icons/io";
import { SortableContainer } from "react-sortable-hoc";

import { Button } from "../button";
import { List } from "../list";
import { SortableSection } from "./Section";
import { Box } from "@mui/material";

const SortableSectionList = SortableContainer(
  ({ blocks, name, ...props }: any) => (
    <List>
      {blocks.map((block: any, index: number) => (
        // @ts-ignore
        <SortableSection
          {...props}
          numberOfBlocks={blocks.length}
          key={block.key}
          block={block}
          index={index}
          name={`${name}.${index}`}
          // index is not provided to children due to a bug
          blockIndex={index}
        />
      ))}
    </List>
  )
);

export function ContentSections({ name }: any) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { fields, append, move, remove } = useFieldArray({
    control,
    keyName: "key",
    name,
  });

  return (
    <div>
      {/*
      // @ts-ignore */}
      <SortableSectionList
        blocks={fields}
        lockAxis="y"
        name={name}
        remove={remove}
        useDragHandle
        onSortEnd={function ({
          oldIndex,
          newIndex,
        }: {
          oldIndex: number;
          newIndex: number;
        }) {
          if (oldIndex === newIndex) {
            return;
          }
          move(oldIndex, newIndex);
        }}
      />
      <Box sx={{ mt: "1rem" }}>
        <Button
          type="button"
          size="small"
          variant="secondary"
          onClick={() =>
            append({ blocks: [{ markdown: "", type: "markdown" }] })
          }
        >
          {/* todo refactor to a ButtonWithicon since sx props not working */}
          <IoMdAdd
            sx={{
              height: "iconSmall",
              mr: "xsmall",
              width: "iconSmall",
            }}
          />
          Ajouter une section
        </Button>
      </Box>
    </div>
  );
}
