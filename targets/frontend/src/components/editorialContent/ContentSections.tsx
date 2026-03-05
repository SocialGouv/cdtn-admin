import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import Add from "@mui/icons-material/Add";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Button } from "../button";
import { List } from "../list";
import { SortableSection } from "./Section";
import { Box } from "@mui/material";
import { theme } from "src/theme";

export function ContentSections({ name, ...rest }: { name: string; [key: string]: any }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { fields, append, move, remove } = useFieldArray({
    control,
    keyName: "key",
    name,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.key === String(active.id));
    const newIndex = fields.findIndex((f) => f.key === String(over.id));
    if (oldIndex !== newIndex) {
      move(oldIndex, newIndex);
    }
  }

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((f) => f.key)}
          strategy={verticalListSortingStrategy}
        >
          <List className="">
            {fields.map((block: any, index: number) => (
              <SortableSection
                numberOfBlocks={fields.length}
                key={block.key}
                id={block.key}
                block={block}
                blockIndex={index}
                name={`${name}.${index}`}
                remove={remove}
              />
            ))}
          </List>
        </SortableContext>
      </DndContext>
      <Box sx={{ mt: "1rem" }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          onClick={() =>
            append({ blocks: [{ markdown: "", type: "markdown" }] })
          }
        >
          <Add
            style={{
              height: theme.sizes.iconSmall,
              marginRight: "0.7rem",
              width: theme.sizes.iconSmall,
            }}
          />
          Ajouter une section
        </Button>
      </Box>
    </div>
  );
}
