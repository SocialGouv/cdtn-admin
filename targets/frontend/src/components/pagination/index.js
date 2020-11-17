/** @jsx jsx */
import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { memo } from "react";
import { Flex, jsx } from "theme-ui";

import { NavButton } from "../button";
import { Inline } from "../layout/Inline";
import { Li, List } from "../list";

// how far has the range to be from the border before displaying "..."
const RANGE_TOLERANCE = 2;

export const Pagination = memo(function _Pagination({
  count,
  currentPage = 0,
  pageSize = 10,
  visibleRange = 2,
}) {
  const nbPages = Math.ceil(count / pageSize);

  if (nbPages === 1) {
    return null;
  }

  let rangeStartIndex = Math.min(
    Math.max(0, currentPage - visibleRange),
    Math.max(nbPages - visibleRange * 2 - 1, 0)
  );
  let rangeEndIndex = Math.min(rangeStartIndex + 1 + visibleRange * 2, nbPages);

  // prevent "..." from displaying if startRange is too close from the beginn
  if (rangeStartIndex <= RANGE_TOLERANCE) {
    rangeStartIndex = 0;
  }
  // prevent "..." from displaying if endRange is too close from the end
  const endRangeNbPageDiff = nbPages - rangeEndIndex;
  if (endRangeNbPageDiff <= RANGE_TOLERANCE) {
    rangeEndIndex += endRangeNbPageDiff;
  }
  const paginationButtons = [];

  if (rangeStartIndex > RANGE_TOLERANCE) {
    paginationButtons.push(
      <PageButton currentPage={currentPage} pageIndex={0} offset={0} />,
      "..."
    );
  }

  for (let i = rangeStartIndex; i < rangeEndIndex; i++) {
    paginationButtons.push(
      <PageButton
        currentPage={currentPage}
        pageIndex={i}
        offset={pageSize * i}
      />
    );
  }

  if (nbPages - rangeEndIndex > RANGE_TOLERANCE) {
    paginationButtons.push(
      "...",
      <PageButton
        currentPage={currentPage}
        pageIndex={nbPages - 1}
        offset={pageSize * (nbPages - 1)}
      />
    );
  }

  return (
    <PaginationList>
      {paginationButtons.map((button, i) => (
        <Li key={`page-button-${i}`}>{button}</Li>
      ))}
    </PaginationList>
  );
});

Pagination.propTypes = {
  count: PropTypes.number.isRequired,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  visibleRange: PropTypes.number,
};

function PaginationList({ children }) {
  return (
    <Flex sx={{ justifyContent: "center" }}>
      <List sx={{ display: "flex", fontSize: "xxsmall" }}>
        <Inline space="xxsmall">{children}</Inline>
      </List>
    </Flex>
  );
}
PaginationList.propTypes = {
  children: PropTypes.node.isRequired,
};

function PageButton({ currentPage, pageIndex }) {
  const router = useRouter();
  const qs = Object.entries(router.query)
    .flatMap(([key, value]) => (key === "page" ? [] : `${key}=${value}`))
    .join("&");
  console.log(pageIndex, currentPage);
  return (
    <Link href={`${router.route}?${qs}&page=${pageIndex}`} passHref>
      <NavButton variant={pageIndex === currentPage ? "accent" : "secondary"}>
        {pageIndex + 1}
      </NavButton>
    </Link>
  );
}

PageButton.propTypes = {
  currentPage: PropTypes.number.isRequired,
  pageIndex: PropTypes.number.isRequired,
};
