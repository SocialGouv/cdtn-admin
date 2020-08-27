/** @jsx jsx */
import PropTypes from "prop-types";
import { Flex, jsx } from "theme-ui";

import { Button } from "../button";
import { Inline } from "../layout/Inline";
import { Li, List } from "../list";

export function Pagination({
  count,
  onChange,
  offset = 0,
  pageSize = 10,
  visibleRange = 2,
}) {
  const nbPage = Math.ceil(count / pageSize);
  const currentPage = Math.floor(offset / pageSize);

  const allPages = Array.from(Array(nbPage))
    .map((_, page) => ({
      index: page,
      label: `${page + 1}`,
      offset: pageSize * page,
    }))
    .map((page) => (
      <Li key={page.label}>
        <Button
          variant={page.index === currentPage ? "accent" : "secondary"}
          sx={{
            py: "xxsmall",
          }}
          onClick={() => onChange({ offset: page.offset })}
        >
          {page.label}
        </Button>
      </Li>
    ));
  const rangeStartIndex = Math.min(
    Math.max(0, currentPage - visibleRange),
    nbPage - visibleRange * 2 - 1
  );
  const rangeEndIndex = Math.min(
    rangeStartIndex + 1 + visibleRange * 2,
    nbPage
  );

  let startPagination = [];
  if (rangeStartIndex > 2) {
    startPagination = allPages
      .slice(0, 1)
      .concat(<Li key="start-range">...</Li>);
  } else {
    startPagination = allPages.slice(0, 2);
  }

  let endPagination = [];
  if (nbPage - rangeEndIndex > 2) {
    endPagination = [<Li key="end-range">...</Li>].concat(allPages.slice(-1));
  } else {
    endPagination = allPages.slice(-2);
  }

  const pages = allPages.slice(
    Math.max(rangeStartIndex, 2),
    Math.min(rangeEndIndex, nbPage - 2)
  );

  return (
    <Flex sx={{ justifyContent: "center" }}>
      <List sx={{ display: "flex", fontSize: "xxsmall" }}>
        <Inline space="xxsmall">
          {startPagination.concat(pages, endPagination)}
        </Inline>
      </List>
    </Flex>
  );
}

Pagination.propTypes = {
  count: PropTypes.number.isRequired,
  offset: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  pageSize: PropTypes.number,
  visibleRange: PropTypes.number,
};
