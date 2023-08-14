import { getLabelBySource } from "@socialgouv/cdtn-sources";
import { IoIosReorder, IoMdTrash } from "react-icons/io";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { Button, IconButton } from "src/components/button";
import { List } from "src/components/list";
import { Alert, Box } from "@mui/material";

export const SortableList = SortableContainer(({ contents, ...props }) => {
  return (
    <List>
      {contents
        .sort(({ position: a }, { position: b }) => a - b)
        .map((content, index) => (
          <SortableRow
            key={content.cdtnId}
            content={content}
            index={index}
            sortable={contents.length > 1}
            {...props}
          />
        ))}
    </List>
  );
});

const SortableRow = SortableElement(
  ({
    content: { cdtnId, source, title, isPublished, isAvailable },
    sortable,
    onDeleteContent,
  }) => (
    <li
      sx={{
        alignItems: "stretch",
        display: "flex",
        justifyContent: "stretch",
        mb: "small",
      }}
    >
      {sortable && <SortHandle />}
      <Alert
        variant="success"
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            color: getColor({ isAvailable, isPublished }),
          }}
        >{`${title} - ${getLabelBySource(source)} ${
          !isAvailable ? "(supprimé)" : ""
        }${isAvailable && !isPublished ? "(Déplublié)" : ""}`}</Box>
      </Alert>
      <Box sx={{ display: "flex", alignItems: "stretch", ml: "xsmall" }}>
        <Button
          sx={{ padding: "small" }}
          type="button"
          variant="secondary"
          onClick={() => {
            onDeleteContent(cdtnId);
          }}
        >
          <IoMdTrash sx={{ height: "iconSmall", width: "iconSmall" }} />
        </Button>
      </Box>
    </li>
  )
);
function getColor({ isPublished, isAvailable }) {
  if (!isAvailable) {
    return "critical";
  }
  if (!isPublished) {
    return "muted";
  }
  return "text";
}
const SortHandle = SortableHandle(() => (
  <IconButton
    variant="secondary"
    type="button"
    sx={{ cursor: "grab", flex: "0 0 auto", height: "auto", mr: "xsmall" }}
  >
    <IoIosReorder sx={{ height: "iconMedium", width: "iconMedium" }} />
  </IconButton>
));
