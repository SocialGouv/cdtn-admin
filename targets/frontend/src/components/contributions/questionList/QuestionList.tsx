import {
  Card,
  CardContent,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  QueryQuestionAnswer,
  useQuestionListQuery,
} from "./QuestionList.query";
import { QuestionRow } from "./QuestionRow";
import { statusesMapping } from "../status/data";
import { Answer } from "../type";

export const countAnswersWithStatus = (
  answers: QueryQuestionAnswer[] | undefined,
  statusToCount: string
): number => {
  const count = answers?.filter((answer) => {
    return answer.status?.status === statusToCount;
  }).length;
  return count ?? 0;
};

export const QuestionList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const { rows } = useQuestionListQuery({
    search,
  });

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
      >
        <TextField
          label="Recherche"
          variant="outlined"
          onChange={(event) => {
            const value = event.target.value;
            setSearch(value ? `%${value}%` : undefined);
          }}
          data-testid="contributions-list-search"
        />
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Questions ({rows.length})</TableCell>
              <TableCell key={statusesMapping.PUBLISHED.text} style={{ color: statusesMapping.PUBLISHED.color }} align="center">
                <Tooltip title={statusesMapping.PUBLISHED.text}>{statusesMapping.PUBLISHED.icon}</Tooltip>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <QuestionRow
                key={row.content}
                row={row}
                data-testid="contributions-list-row"
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};
