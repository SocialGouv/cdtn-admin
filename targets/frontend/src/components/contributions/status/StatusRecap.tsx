import { TableCell } from "@mui/material";
import { statusesMapping } from "./data";
import { countAnswersWithStatus, QueryQuestionAnswer } from "../questionList";

export const StatusRecap = ({
  answers,
  key,
}: {
  answers: QueryQuestionAnswer[] | undefined;
  key?: string;
}) => {
  return (
    <>
      {Object.entries(statusesMapping).map(([status, { color }]) => {
        const count = countAnswersWithStatus(answers, status);
        return (
          <TableCell
            component="th"
            scope="row"
            key={`${key}-${status}`}
            style={{ color }}
            align="center"
          >
            <strong>{count}</strong>
          </TableCell>
        );
      })}
    </>
  );
};
