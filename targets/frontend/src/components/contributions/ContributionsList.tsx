import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";

import { Pagination } from "../utils";
import { ContributionsRow } from "./ContributionsRow";

export const ContributionsList = () => {
  const rows = [
    {
      answers: [
        {
          code: "1111",
          content: "answer1",
        },
        {
          code: "2222",
          content: "answer2",
        },
        {
          code: "3333",
          content: "answer3",
        },
      ],
      content: "question1",
    },
    {
      answers: [
        {
          code: "1111",
          content: "answer1",
        },
        {
          code: "2222",
          content: "answer2",
        },
        {
          code: "3333",
          content: "answer3",
        },
      ],
      content: "question2",
    },
    {
      answers: [
        {
          code: "1111",
          content: "answer1",
        },
        {
          code: "2222",
          content: "answer2",
        },
        {
          code: "3333",
          content: "answer3",
        },
      ],
      content: "question3",
    },
    {
      answers: [
        {
          code: "1111",
          content: "answer1",
        },
        {
          code: "2222",
          content: "answer2",
        },
        {
          code: "3333",
          content: "answer3",
        },
      ],
      content: "question3",
    },
  ];
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableBody>
          {rows.map((row) => (
            <ContributionsRow key={row.content} row={row} />
          ))}
        </TableBody>
      </Table>
      <Box sx={{ flexShrink: 0, float: "right", ml: 2.5 }}>
        <Pagination
          totalPage={rows.length}
          onPageChange={(page) => {
            console.log(page);
          }}
        />
      </Box>
    </TableContainer>
  );
};
