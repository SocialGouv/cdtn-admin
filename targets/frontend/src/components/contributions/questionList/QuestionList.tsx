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
import { fr } from "@codegouvfr/react-dsfr";
import { statusesMapping } from "../status/data";
import { StatusStats } from "../status/StatusStats";

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

  const aggregatedRow = rows.map(({ answers }) => answers).flat();
  const total = aggregatedRow.length;
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
        <Card>
          <CardContent>
            <Typography>Total</Typography>
            <Typography
              sx={{
                fontWeight: "bold",
                color: fr.colors.decisions.text.default.grey.default,
              }}
            >
              {total}
            </Typography>
          </CardContent>
        </Card>

        <StatusStats
          statusCounts={Object.keys(statusesMapping).map((status) => ({
            status,
            count: countAnswersWithStatus(aggregatedRow, status),
          }))}
          total={total}
        ></StatusStats>
      </Stack>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Questions ({rows.length})</TableCell>
              {Object.entries(statusesMapping).map(
                ([_, { text, icon, color }]) => {
                  return (
                    <TableCell key={text} style={{ color }} align="center">
                      <Tooltip title={text}>{icon}</Tooltip>
                    </TableCell>
                  );
                }
              )}
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
