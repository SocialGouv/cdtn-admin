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
  Typography,
} from "@mui/material";
import { useState } from "react";

import { useQuestionListQuery } from "./QuestionList.query";
import { countAnswersWithStatus, QuestionRow } from "./QuestionRow";
import { fr } from "@codegouvfr/react-dsfr";
import { statusesMapping } from "../status/data";

export function getPercentage(count: number, total: number) {
  return ((count / total) * 100).toFixed(2);
}

export const QuestionList = (): JSX.Element => {
  const [search, setSearch] = useState<string | undefined>();
  const { rows } = useQuestionListQuery({
    search,
  });

  const aggregatedRow = rows.map(({ answers }) => answers).flat();
  const total = aggregatedRow.length;
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
        <Card>
          <CardContent>
            <Typography>Total</Typography>
            <Typography
              sx={{
                fontWeight: "bold",
                color: fr.colors.decisions.text.default.grey.default,
                marginBottom: "24px",
              }}
            >
              {total}
            </Typography>
          </CardContent>
        </Card>

        {Object.entries(statusesMapping).map(([status, { text, color }]) => {
          const count = countAnswersWithStatus(aggregatedRow, status);
          return (
            <Card key={status}>
              <CardContent sx={{ color }}>
                {text}
                <Typography sx={{ fontWeight: "bold" }}>{count}</Typography>
                <span>{getPercentage(count, total)}%</span>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Questions ({rows.length})</TableCell>
              {Object.entries(statusesMapping).map(([_, { text, color }]) => {
                return (
                  <TableCell key={text} style={{ color }} align="center">
                    {text}
                  </TableCell>
                );
              })}
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
