import { getLabelBySource } from "@socialgouv/cdtn-utils";
import { IoIosReorder, IoMdTrash } from "react-icons/io";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { Button, IconButton } from "src/components/button";
import { List } from "src/components/list";
import { Alert, Box } from "@mui/material";
import { theme as th } from "../../../theme";

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
      style={{
        alignItems: "stretch",
        display: "flex",
        justifyContent: "stretch",
        marginBottom: th.space.small,
      }}
    >
      {sortable && <SortHandle />}
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
  )
);
function getColor({ isPublished, isAvailable }) {
  if (!isAvailable) {
    return th.colors.critical;
  }
  if (!isPublished) {
    return th.colors.muted;
  }
  return th.colors.text;
}
const SortHandle = SortableHandle(() => (
  <IconButton
    variant="secondary"
    type="button"
    style={{
      cursor: "grab",
      flex: "0 0 auto",
      height: "auto",
      marginRight: th.space.xsmall,
    }}
  >
    <IoIosReorder
      style={{ height: th.sizes.iconMedium, width: th.sizes.iconMedium }}
    />
  </IconButton>
));
