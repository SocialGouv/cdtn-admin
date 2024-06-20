import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/router";

import { QueryQuestion } from "./QuestionList.query";

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
      <TableCell component="th" scope="row" align="center">
        <strong>{row.answers_aggregate.aggregate.count || "-"}</strong>
      </TableCell>
    </TableRow>
  );
};
