import Link from "next/link";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { memo } from "react";
import { Flex } from "theme-ui";

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

function PageButton({ pageIndex }) {
  const router = useRouter();

  return (
    <Link href={addPaginationParam(router.asPath, pageIndex)} passHref shallow>
      {pageIndex + 1}
    </Link>
  );
}

/**
 * add pagination param to a given url
 * 3 cases:
 *  - querystring param with a page param
 *  - querystring without page param
 *  - no querystring param
 */
function addPaginationParam(url, pageIndex) {
  if (url.includes("?")) {
    if (/page=(\d+)/.test(url)) {
      return url.replace(/(&|\?)page=(\d+)(&|$)/, `$1page=${pageIndex}$3`);
    } else {
      return `${url}&page=${pageIndex}`;
    }
  }
  return `${url}?page=${pageIndex}`;
}

PageButton.propTypes = {
  currentPage: PropTypes.number.isRequired,
  pageIndex: PropTypes.number.isRequired,
};
