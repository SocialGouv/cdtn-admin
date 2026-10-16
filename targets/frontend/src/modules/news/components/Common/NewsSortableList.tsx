import React from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, IconButton, Stack } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import {
  Delete,
  DragIndicator,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "src/components/utils/dsfrIcons";

type NewsSortableListProps<T extends { id: string }> = {
  items: T[];
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemLabel: (item: T) => string;
};

type SortableRowProps<T extends { id: string }> = {
  item: T;
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  itemLabel: (item: T) => string;
};

function SortableRow<T extends { id: string }>({
  item,
  index,
  count,
  onMove,
  onRemove,
  renderItem,
  itemLabel,
}: SortableRowProps<T>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });
  const label = itemLabel(item);

  return (
    <Stack
      ref={setNodeRef}
      direction="row"
      alignItems="center"
      spacing={2}
      padding={1}
      border={`1px solid ${fr.colors.decisions.border.default.grey.default}`}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <IconButton
        {...attributes}
        {...listeners}
        aria-label={`Déplacer ${label}`}
      >
        <DragIndicator />
      </IconButton>
      <Box flex={1}>{renderItem(item, index)}</Box>
      <IconButton
        aria-label={`Monter ${label}`}
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
      >
        <KeyboardArrowUp />
      </IconButton>
      <IconButton
        aria-label={`Descendre ${label}`}
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <KeyboardArrowDown />
      </IconButton>
      <IconButton
        aria-label={`Supprimer ${label}`}
        onClick={() => onRemove(index)}
      >
        <Delete />
      </IconButton>
    </Stack>
  );
}

export function NewsSortableList<T extends { id: string }>({
  items,
  onMove,
  onRemove,
  renderItem,
  itemLabel,
}: NewsSortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onMove(oldIndex, newIndex);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <Stack spacing={1}>
          {items.map((item, index) => (
            <SortableRow
              key={item.id}
              item={item}
              index={index}
              count={items.length}
              onMove={onMove}
              onRemove={onRemove}
              renderItem={renderItem}
              itemLabel={itemLabel}
            />
          ))}
        </Stack>
      </SortableContext>
    </DndContext>
  );
}
