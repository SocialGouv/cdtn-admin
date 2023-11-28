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
import React from "react";
import { Answer } from "../type";
import { StatusContainer } from "../status";
import { useRouter } from "next/router";

type EditQuestionAnswerListProps = {
  answers: Answer[];
};

export const QuestionAnswerList = ({
  answers,
}: EditQuestionAnswerListProps): JSX.Element => {
  const router = useRouter();
  return (
    <Stack alignItems="stretch">
      <Stack>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="purchases">
            <TableHead>
              <TableRow>
                <TableCell align="center">IDCC</TableCell>
                <TableCell>Convention Collective</TableCell>
                <TableCell align="center">Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {answers?.map((answer) => {
                return (
                  <TableRow
                    key={answer.agreement.id}
                    style={{ cursor: "pointer" }}
                    hover
                    onClick={() => {
                      router.push(`/contributions/answers/${answer.id}`);
                    }}
                  >
                    <TableCell scope="row">{answer?.agreement?.id}</TableCell>
                    <TableCell scope="row">{answer?.agreement?.name}</TableCell>
                    <TableCell scope="row" align="center">
                      {answer.status && (
                        <StatusContainer status={answer.status} />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
};