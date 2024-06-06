import { TableCell } from "@mui/material";
import { statusesMapping } from "./data";
import { countAnswersWithStatus, QueryQuestionAnswer } from "../questionList";

export const StatusRecap = ({
  answers,
  uniqKey = "",
}: {
  answers: QueryQuestionAnswer[] | undefined;
  uniqKey?: string;
}) => {
  return (
    <>
      {Object.entries(statusesMapping)
        .filter(([status]) => status === "PUBLISHED")
        .map(([status, { color }]) => {
          const count = countAnswersWithStatus(answers, status);
          return (
            <TableCell
              component="th"
              scope="row"
              key={`${uniqKey}-${status}`}
              style={{ color }}
              align="center"
            >
              <strong>{count ? count : "-"}</strong>
            </TableCell>
          );
        })}
    </>
  );
};
