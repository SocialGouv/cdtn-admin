/** @jsx jsx  */

import { getLabelBySource } from "@socialgouv/cdtn-sources";
import { IoIosReorder, IoMdTrash } from "react-icons/io";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { Button, IconButton } from "src/components/button";
import { List } from "src/components/list";
import { Alert, Box, Flex, jsx } from "theme-ui";

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
  ({ content: { cdtnId, source, title }, sortable, onDeleteContent }) => (
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
        variant="highlight"
        sx={{
          display: "flex",
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        <Box>{`${title} - ${getLabelBySource(source)}`}</Box>
      </Alert>
      <Flex sx={{ alignItems: "stretch", ml: "xsmall" }}>
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
      </Flex>
    </li>
  )
);

const SortHandle = SortableHandle(() => (
  <IconButton
    variant="secondary"
    type="button"
    sx={{ cursor: "grab", flex: "0 0 auto", height: "auto", mr: "xsmall" }}
  >
    <IoIosReorder sx={{ height: "iconMedium", width: "iconMedium" }} />
  </IconButton>
));
