import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useState } from "react";

export const Pagination = ({
  page = 0,
  interval = 2,
  totalPage,
  onPageChange,
}: {
  page?: number;
  interval?: number;
  totalPage: number;
  onPageChange: (currentPage: number) => void;
}) => {
  const [currentPage, setCurrentPage] = useState(page);
  const lastPage = Math.floor(totalPage / interval);
  return (
    <Box sx={{ flexShrink: 0, float: "right", ml: 2.5 }}>
      <IconButton
        aria-label="previous page"
        disabled={currentPage === 0}
        onClick={() => {
          setCurrentPage(currentPage - 1);
          onPageChange(currentPage);
        }}
      >
        <KeyboardArrowLeftIcon />
      </IconButton>
      <IconButton
        aria-label="next page"
        disabled={currentPage === lastPage}
        onClick={() => {
          setCurrentPage(currentPage + 1);
          onPageChange(currentPage);
        }}
      >
        <KeyboardArrowRightIcon />
      </IconButton>
    </Box>
  );
};
