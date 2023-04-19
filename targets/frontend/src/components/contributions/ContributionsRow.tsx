import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import * as React from "react";

import { Question } from "./type";

export const ContributionsRow = (props: {
  row: Question;
  preOpen?: boolean;
}) => {
  const { row, preOpen = false } = props;
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(preOpen);
  }, [preOpen]);

  return (
    <>
      <TableRow
        sx={{ "& > *": { borderBottom: "unset" } }}
        key={row.id}
        data-testid={`row-${row.id}`}
      >
        <TableCell>
          <IconButton aria-label="expand row" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {row.content}
        </TableCell>
        <TableCell component="th" scope="row">
          <div
            style={{
              color: "orange",
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Box sx={{ marginTop: "2px" }}>
              <b>{row.answers.filter(({ status }) => !status).length}</b>
            </Box>
            <ClearIcon />
          </div>
        </TableCell>
        <TableCell component="th" scope="row">
          <div
            style={{
              color: "green",
              display: "flex",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Box sx={{ marginTop: "2px" }}>
              <b>{row.answers.filter(({ status }) => status).length}</b>
            </Box>
            <CheckIcon />
          </div>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} unmountOnExit>
            <>
              <Box>
                <Table size="small" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>Idcc</TableCell>
                      <TableCell>Convention collective</TableCell>
                      <TableCell align="center">Affichage</TableCell>
                      <TableCell align="center">Statut</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.answers?.map((answer) => (
                      <TableRow key={answer.agreements.id}>
                        <TableCell scope="row" style={{ width: "80px" }}>
                          {answer.agreements.id}
                        </TableCell>
                        <TableCell scope="row">
                          {answer.agreements.name}
                        </TableCell>
                        <TableCell
                          scope="row"
                          style={{ width: "120px" }}
                          align="center"
                        >
                          {answer.display_mode}
                        </TableCell>
                        <TableCell
                          scope="row"
                          style={{ width: "180px" }}
                          align="center"
                        >
                          {answer.status === "DONE" ? (
                            <div
                              style={{
                                color: "green",
                                display: "flex",
                                justifyContent: "end",
                                textAlign: "center",
                              }}
                              data-testid={`${row.id}-${answer.agreements.id}-done`}
                            >
                              <Box sx={{ marginTop: "2px" }}>TRAITÉ</Box>
                              <ClearIcon />
                            </div>
                          ) : (
                            <div
                              style={{
                                color: "orange",
                                display: "flex",
                                justifyContent: "end",
                                textAlign: "center",
                              }}
                              data-testid={`${row.id}-${answer.agreements.id}-todo`}
                            >
                              <Box sx={{ marginTop: "2px" }}>NON TRAITÉ</Box>
                              <ClearIcon />
                            </div>
                          )}
                        </TableCell>
                        <TableCell scope="row" style={{ width: "50px" }}>
                          <IconButton aria-label="modifier" size="small">
                            <ModeEditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
