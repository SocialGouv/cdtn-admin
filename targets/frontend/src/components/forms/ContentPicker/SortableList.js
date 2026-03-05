import { getLabelBySource } from "@socialgouv/cdtn-utils";
import { IoIosReorder, IoMdTrash } from "react-icons/io";
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
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, IconButton } from "src/components/button";
import { List } from "src/components/list";
import { Alert, Box } from "@mui/material";
import { theme as th } from "../../../theme";

export function SortableList({ contents, onSortEnd, onDeleteContent }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sorted = [...contents].sort(
    ({ position: a }, { position: b }) => a - b
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((c) => c.cdtnId === active.id);
    const newIndex = sorted.findIndex((c) => c.cdtnId === over.id);
    onSortEnd({ oldIndex, newIndex });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sorted.map((c) => c.cdtnId)}
        strategy={verticalListSortingStrategy}
      >
        <List>
          {sorted.map((content) => (
            <SortableRow
              key={content.cdtnId}
              content={content}
              sortable={sorted.length > 1}
              onDeleteContent={onDeleteContent}
            />
          ))}
        </List>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  content: { cdtnId, source, title, isPublished, isAvailable },
  sortable,
  onDeleteContent,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: cdtnId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    alignItems: "stretch",
    display: "flex",
    justifyContent: "stretch",
    marginBottom: th.space.small,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes}>
      {sortable && (
        <IconButton
          variant="secondary"
          type="button"
          style={{
            cursor: "grab",
            flex: "0 0 auto",
            height: "auto",
            marginRight: th.space.xsmall,
          }}
          {...listeners}
        >
          <IoIosReorder
            style={{
              height: th.sizes.iconMedium,
              width: th.sizes.iconMedium,
            }}
          />
        </IconButton>
      )}
      <Alert
        variant="success"
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <Box
          style={{
            color: getColor({ isAvailable, isPublished }),
          }}
        >{`${title} - ${getLabelBySource(source)} ${
          !isAvailable ? "(supprimé)" : ""
        }${isAvailable && !isPublished ? "(Déplublié)" : ""}`}</Box>
      </Alert>
      <Box
        style={{
          display: "flex",
          alignItems: "stretch",
          marginLeft: th.space.xsmall,
        }}
      >
        <Button
          style={{ padding: "small" }}
          type="button"
          variant="secondary"
          onClick={() => {
            onDeleteContent(cdtnId);
          }}
        >
          <IoMdTrash
            style={{ height: th.sizes.iconSmall, width: th.sizes.iconSmall }}
          />
        </Button>
      </Box>
    </li>
  );
}

function getColor({ isPublished, isAvailable }) {
  if (!isAvailable) {
    return th.colors.critical;
  }
  if (!isPublished) {
    return th.colors.muted;
  }
  return th.colors.text;
}
