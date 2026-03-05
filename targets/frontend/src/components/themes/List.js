import Link from "next/link";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ArrowCircleRight, DragIndicator } from "../utils/dsfrIcons";
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
import { IconButton } from "src/components/button";
import { useSession } from "next-auth/react";
import { Alert, Card, Box } from "@mui/material";
import { theme as th } from "../../theme";

const formatRelationsIntoThemes = (relations = []) =>
  relations
    .sort(({ position: a }, { position: b }) => a - b)
    .map(({ id, child }) => ({
      relationId: id,
      ...child,
    }));

const List = ({ relations, updateThemesPosition }) => {
  const { data } = useSession();
  const isAdmin = data?.user.isAdmin;
  const [displayedThemes, setDisplayedThemes] = useState(
    formatRelationsIntoThemes(relations)
  );
  useEffect(() => {
    setDisplayedThemes(formatRelationsIntoThemes(relations));
  }, [relations]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = displayedThemes.findIndex((t) => t.cdtnId === active.id);
    const newIndex = displayedThemes.findIndex((t) => t.cdtnId === over.id);
    const newThemes = arrayMove(displayedThemes, oldIndex, newIndex);

    setDisplayedThemes(newThemes);
    updateThemesPosition({
      objects: newThemes.map((theme, index) => ({
        data: { position: index },
        document_b: theme.cdtnId,
        id: theme.relationId,
        type: "theme",
      })),
    });
  }

  return (
    <>
      {displayedThemes.length === 0 ? (
        <Alert severity="success" sx={{ mb: "small" }}>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            Il n&apos;y a aucun thème pour le moment !
          </p>
        </Alert>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayedThemes.map((t) => t.cdtnId)}
            strategy={verticalListSortingStrategy}
          >
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {displayedThemes.map((theme) => (
                <ThemeRow
                  key={theme.cdtnId}
                  theme={theme}
                  isAdmin={isAdmin}
                  sortable={displayedThemes.length > 1}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </>
  );
};
List.propTypes = {
  relations: PropTypes.array,
  updateThemesPosition: PropTypes.func.isRequired,
};

export { List };

function ThemeRow({ isAdmin, sortable, theme }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: theme.cdtnId });

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
      {isAdmin && sortable && (
        <IconButton
          variant="secondary"
          style={{ cursor: "grab", height: "auto", mr: th.space.xsmall }}
          {...listeners}
        >
          <DragIndicator
            style={{
              height: th.sizes.iconMedium,
              width: th.sizes.iconMedium,
            }}
          />
        </IconButton>
      )}
      <Link
        href={`/themes/${theme.cdtnId}`}
        passHref
        style={{ textDecoration: "none" }}
      >
        <Card
          style={{
            ":hover": { boxShadow: "cardHover" },
            ":link, :visited": { color: "text" },
            color: "text",
            cursor: "pointer",
            display: "block",
            flex: 1,
            justifyContent: "space-between",
            textDecoration: "none",
            padding: "30px",
            width: "fit-content",
          }}
        >
          <Box
            sx={{
              alignItems: "center",
              fontSize: "1.2rem",
              justifyContent: "space-between",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "flex",
            }}
          >
            {theme.title}
            <ArrowCircleRight
              style={{
                height: th.sizes.iconMedium,
                marginLeft: th.space.small,
                width: th.sizes.iconMedium,
              }}
            />
          </Box>
        </Card>
      </Link>
    </li>
  );
}
