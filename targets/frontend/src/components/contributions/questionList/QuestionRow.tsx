import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";

import { StatusRecap } from "../status";
import { QueryQuestion, QueryQuestionAnswer } from "./QuestionList.query";

const countAnswersWithStatus = (
  answers: QueryQuestionAnswer[] | undefined,
  statusToCount: string
) =>
  answers?.filter(({ status }) => status?.status === statusToCount).length ?? 0;

export const QuestionRow = (props: { row: QueryQuestion }) => {
  const { row } = props;
  const router = useRouter();

  return (
    <>
      <TableRow
        key={row.id}
        data-testid={`row-${row.id}`}
        onClick={() => {
          router.push(`/contributions/questions/${row.id}`);
        }}
        style={{ cursor: "pointer" }}
        hover
      >
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
            key={`${row.id}-statuses`}
          />
        </TableCell>
      </TableRow>
    </>
  );
};
