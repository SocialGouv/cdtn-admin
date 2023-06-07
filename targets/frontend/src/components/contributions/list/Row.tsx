import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";
import * as React from "react";

import { StatusContainer, StatusRecap } from "../status";
import { QueryQuestion, QueryQuestionAnswer } from "./List.query";
import { Button } from "@mui/material";

const countAnswersWithStatus = (
  answers: QueryQuestionAnswer[] | undefined,
  statusToCount: string
) =>
  answers?.filter(({ status }) => status.status === statusToCount).length ?? 0;

export const ContributionsRow = (props: {
  row: Partial<QueryQuestion>;
  preOpen?: boolean;
}) => {
  const { row, preOpen = false } = props;
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(preOpen);
  }, [preOpen]);

  return (
    <>
      <TableRow key={row.id} data-testid={`row-${row.id}`}>
        <TableCell>
          <IconButton aria-label="expand row" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Button
            color="info"
            sx={{ textTransform: "none" }}
            onClick={() => setOpen(!open)}
          >
            {row.content}
          </Button>
        </TableCell>
        <TableCell component="th" scope="row">
          <StatusRecap
            todo={countAnswersWithStatus(row.answers, "TODO")}
            redacting={countAnswersWithStatus(row.answers, "REDACTING")}
            redacted={countAnswersWithStatus(row.answers, "REDACTED")}
            validating={countAnswersWithStatus(row.answers, "VALIDATING")}
            validated={countAnswersWithStatus(row.answers, "VALIDATED")}
            published={countAnswersWithStatus(row.answers, "PUBLISHED")}
          />
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="modifier"
            size="small"
            color="primary"
            onClick={() => {
              router.push(`/contributions/questions/${row.id}`);
            }}
          >
            <ModeEditIcon />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell padding="none" colSpan={6}>
          <Collapse in={open} unmountOnExit>
            <Box>
              <Table size="small" aria-label="purchases">
                <TableBody>
                  {row.answers?.map((answer) => {
                    const status = answer?.status;
                    return (
                      <TableRow key={answer.agreement.id}>
                        <TableCell scope="row">{answer.agreement.id}</TableCell>
                        <TableCell scope="row">
                          {answer.agreement.name}
                        </TableCell>
                        <TableCell scope="row" align="center">
                          <StatusContainer
                            status={status}
                            dataTestid={`${row.id}-${answer.agreement.id}-${status}`}
                          />
                        </TableCell>
                        <TableCell scope="row">
                          <IconButton
                            aria-label="modifier"
                            size="small"
                            color="primary"
                            onClick={() => {
                              router.push(
                                `/contributions/answers/${answer.id}`
                              );
                            }}
                          >
                            <ModeEditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
