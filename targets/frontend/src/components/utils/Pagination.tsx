import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";

export const Pagination = ({
  page = 0,
  interval,
  totalPage,
  onPageChange,
}: {
  page?: number;
  interval: number;
  totalPage: number;
  onPageChange: (currentPage: number) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(page);
  const [lastPage, setlastPage] = useState(0);
  useEffect(() => {
    setCurrentPage(page);
  }, [page]);
  useEffect(() => {
    setlastPage(Math.floor(totalPage / interval));
  }, [totalPage]);
  return (
    <Box sx={{ flexShrink: 0, float: "right", ml: 2.5 }}>
      <span>
        Page {currentPage + 1} / {lastPage + 1}
      </span>
      <IconButton
        aria-label="previous page"
        disabled={currentPage === 0}
        onClick={() => {
          const prevPage = currentPage - 1;
          setCurrentPage(prevPage);
          onPageChange(prevPage);
        }}
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton
        aria-label="next page"
        disabled={currentPage === lastPage}
        onClick={() => {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          onPageChange(nextPage);
        }}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
    </Box>
  );
};
