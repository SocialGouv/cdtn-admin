import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";

import { StatusRecap } from "../status";
import { QueryQuestion } from "./QuestionList.query";
import { Answer } from "../type";

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
        <strong>{row.order}</strong> - {row.content}
      </TableCell>
      <StatusRecap
        answers={row.answers as Answer[]}
        uniqKey={`${row.id}-statuses`}
      />
    </TableRow>
  );
};
