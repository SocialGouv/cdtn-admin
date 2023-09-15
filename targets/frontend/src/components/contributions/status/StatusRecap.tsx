import { Box, Stack } from "@mui/material";
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
    <Stack
      key={key}
      direction="row"
      spacing={4}
      alignItems="end"
      justifyContent="end"
    >
      {Object.entries(statusesMapping).map(([status, { icon, color }]) => {
        const count = countAnswersWithStatus(answers, status);
        if (!count) return <></>;
        return (
          <Stack
            key={`${key}-${status}`}
            direction="row"
            style={{ color }}
            spacing={1}
          >
            {icon}
            <Box>
              <strong>{count}</strong>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
};
