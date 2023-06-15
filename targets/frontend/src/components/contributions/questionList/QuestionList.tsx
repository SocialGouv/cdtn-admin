import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TextField,
  TableRow,
  TableCell,
} from "@mui/material";
import { useState } from "react";

import { useQuestionListQuery } from "./QuestionList.query";
import { QuestionRow } from "./QuestionRow";

export const QuestionList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const { rows } = useQuestionListQuery({
    search,
  });
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="start" spacing={2}>
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
              <TableCell>Question</TableCell>
              <TableCell align="center">Statut</TableCell>
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
