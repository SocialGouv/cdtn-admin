import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";

import {
  QueryQuestionAnswer,
  useQuestionListQuery,
} from "./QuestionList.query";
import { QuestionRow } from "./QuestionRow";
import { useRouter } from "next/router";
import { Toolbar } from "../../list/Toolbard";

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
  const router = useRouter();
  const [search, setSearch] = useState<string | undefined>();

  const { rows } = useQuestionListQuery({
    search,
  });

  return (
    <Stack spacing={2}>
      <Toolbar
        numSelected={0}
        onClickCreation={() => {
          router.push(`/contributions/questions/creation`);
        }}
        setSearch={(value) => {
          setSearch(value ? `%${value}%` : undefined);
        }}
      />

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table" size="small">
          <TableHead>
            <TableRow>
              <TableCell>Questions ({rows.length})</TableCell>
              <TableCell align="center">Publiées</TableCell>
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
