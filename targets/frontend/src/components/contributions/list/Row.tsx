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
import { useRouter } from "next/router";
import * as React from "react";

import { StatusContainer } from "../status";
import { StatusRecap } from "../status/StatusRecap";
import { QueryQuestion } from "./List.query";

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
          <StatusRecap
            todo={
              row?.answers?.filter(({ statuses }) => !statuses.length).length ??
              0
            }
            redacting={
              row?.answers?.filter(
                ({ statuses }) => statuses?.[0]?.status === "REDACTING"
              ).length ?? 0
            }
            redacted={
              row?.answers?.filter(
                ({ statuses }) => statuses?.[0]?.status === "REDACTED"
              ).length ?? 0
            }
            validating={
              row?.answers?.filter(
                ({ statuses }) => statuses?.[0]?.status === "VALIDATING"
              ).length ?? 0
            }
            validated={
              row?.answers?.filter(
                ({ statuses }) => statuses?.[0]?.status === "VALIDATED"
              ).length ?? 0
            }
            published={
              row?.answers?.filter(
                ({ statuses }) => statuses?.[0]?.status === "PUBLISHED"
              ).length ?? 0
            }
          />
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="modifier"
            size="small"
            onClick={() => {
              router.push(`/contributions/questions/${row.id}`);
            }}
          >
            <ModeEditIcon />
          </IconButton>
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
                      <TableCell align="center">Statut</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.answers?.map((answer) => {
                      const status = answer?.statuses?.[0]?.status ?? "TODO";
                      return (
                        <TableRow key={answer.agreement.id}>
                          <TableCell scope="row">
                            {answer.agreement.id}
                          </TableCell>
                          <TableCell scope="row">
                            {answer.agreement.name}
                          </TableCell>
                          <TableCell scope="row" align="center">
                            <StatusContainer
                              status={status}
                              user={answer?.statuses?.[0]?.user?.name}
                              dataTestid={`${row.id}-${answer.agreement.id}-${status}`}
                            />
                          </TableCell>
                          <TableCell scope="row">
                            <IconButton
                              aria-label="modifier"
                              size="small"
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
            </>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
