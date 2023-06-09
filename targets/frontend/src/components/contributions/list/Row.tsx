import ModeEditIcon from "@mui/icons-material/ModeEdit";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";
import * as React from "react";

import { StatusRecap } from "../status";
import { QueryQuestion, QueryQuestionAnswer } from "./List.query";

const countAnswersWithStatus = (
  answers: QueryQuestionAnswer[] | undefined,
  statusToCount: string
) =>
  answers?.filter(({ status }) => status?.status === statusToCount).length ?? 0;

export const ContributionsRow = (props: { row: Partial<QueryQuestion> }) => {
  const { row } = props;
  const router = useRouter();

  return (
    <>
      <TableRow key={row.id} data-testid={`row-${row.id}`}>
        <TableCell component="th" scope="row">
          {row.content}
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
    </>
  );
};
