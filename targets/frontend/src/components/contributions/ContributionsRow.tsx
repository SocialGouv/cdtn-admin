import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import * as React from "react";

import { Pagination } from "../utils";

export type ContributionsRowProps = {
  content: string;
  answers: { code: string; content: string }[];
};

export const ContributionsRow = (props: { row: ContributionsRowProps }) => {
  const { row } = props;
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState([]);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }} key={row.content}>
        <TableCell>
          <IconButton aria-label="expand row" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.content}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} unmountOnExit>
            <>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  {row.answers.map((answer) => (
                    <TableRow key={answer.code}>
                      <TableCell component="th" scope="row">
                        {answer.code}
                      </TableCell>
                      <TableCell>{answer.content}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ flexShrink: 0, float: "right", ml: 2.5 }}>
                <Pagination
                  totalPage={row.answers.length}
                  onPageChange={(page) => {
                    console.log(page);
                  }}
                />
              </Box>
            </>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
