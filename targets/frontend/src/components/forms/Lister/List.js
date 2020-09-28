/** @jsx jsx  */

import { IoIosReorder, IoMdClose } from "react-icons/io";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import { IconButton } from "src/components/button";
import { Box, Flex, jsx } from "theme-ui";

export const List = SortableContainer(({ entries = [], ...props }) => {
  return (
    <ul
      sx={{
        backgroundColor: "#f9f9f9",
        borderRadius: "small",
        listStyleType: "none",
        m: "0",
        mt: "xxsmall",
        p: "0.4rem",
      }}
    >
      {entries.map((entry, index) => (
        <ContentRow
          key={entry}
          entry={entry}
          index={index}
          sortable={entries.length > 1}
          {...props}
        />
      ))}
    </ul>
  );
});

const ContentRow = SortableElement(
  ({ entry, disabled, sortable, onDeleteEntry }) => (
    <li
      sx={{
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Flex>
        {!disabled && (
          <Flex
            sx={{
              mr: "xxsmall",
            }}
          >
            <IconButton
              sx={{ flex: "0 0 auto", padding: "small" }}
              type="button"
              variant="secondary"
              onClick={() => {
                onDeleteEntry(entry);
              }}
            >
              <IoMdClose
                sx={{ flex: "1 0 auto", height: "1rem", width: "1rem" }}
              />
            </IconButton>
          </Flex>
        )}
        <Box>{`${entry}`}</Box>
      </Flex>
      {!disabled && sortable && <SortHandle />}
    </li>
  )
);

const SortHandle = SortableHandle(() => (
  <IconButton
    variant="secondary"
    type="button"
    sx={{
      cursor: "grab",
      flex: "0 0 auto",
      ml: "xsmall",
    }}
  >
    <IoIosReorder sx={{ height: "1.4rem", width: "1.4rem" }} />
  </IconButton>
));
