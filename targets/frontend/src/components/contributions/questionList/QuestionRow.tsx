import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";

import { StatusRecap } from "../status";
import { QueryQuestion, QueryQuestionAnswer } from "./QuestionList.query";

export const countAnswersWithStatus = (
  answers: QueryQuestionAnswer[] | undefined,
  statusToCount: string
): number =>
  answers?.filter(({ status }) => status?.status === statusToCount).length ?? 0;

export const QuestionRow = (props: { row: QueryQuestion }) => {
  const { row } = props;
  const router = useRouter();

  return (
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
        <StatusRecap answers={row.answers} key={`${row.id}-statuses`} />
      </TableCell>
    </TableRow>
  );
};
