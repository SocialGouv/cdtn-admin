/** @jsx jsx  */

import { getLabelBySource } from "@socialgouv/cdtn-sources";
import { IoIosReorder, IoMdTrash } from "react-icons/io";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { Button, IconButton } from "src/components/button";
import { Alert, Box, Flex, jsx } from "theme-ui";

export const ContentList = SortableContainer(({ contents, ...props }) => {
  return (
    <ul sx={{ listStyleType: "none", m: "0", p: "0" }}>
      {contents.map((content, index) => (
        <ContentRow
          key={content.cdtnId}
          content={content}
          index={index}
          sortable={contents.length > 1}
          {...props}
        />
      ))}
    </ul>
  );
});

const ContentRow = SortableElement(
  ({
    content: { cdtnId, source, title },
    isAdmin,
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
      {isAdmin && sortable && <SortHandle />}
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
      {isAdmin && (
        <Flex sx={{ alignItems: "stretch", ml: "xsmall" }}>
          <Button
            sx={{ padding: "small" }}
            type="button"
            variant="secondary"
            onClick={() => {
              onDeleteContent(cdtnId);
            }}
          >
            <IoMdTrash sx={{ height: "1.4rem", width: "1.4rem" }} />
          </Button>
        </Flex>
      )}
    </li>
  )
);

const SortHandle = SortableHandle(() => (
  <IconButton
    variant="secondary"
    type="button"
    sx={{ cursor: "grab", flex: "0 0 auto", height: "auto", mr: "xsmall" }}
  >
    <IoIosReorder sx={{ height: "2rem", width: "2rem" }} />
  </IconButton>
));
