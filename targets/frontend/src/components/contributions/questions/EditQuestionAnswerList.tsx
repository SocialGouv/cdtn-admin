import ModeEditIcon from "@mui/icons-material/ModeEdit";
import {
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  TableContainer,
  Paper,
  Stack,
} from "@mui/material";
import React, { useState } from "react";
import { Answer } from "../type";
import { StatusContainer } from "../status";
import { useRouter } from "next/router";
import { Pagination } from "../../utils";

type EditQuestionAnswerListProps = {
  answers: Answer[];
};

export const EditQuestionAnswerList = ({
  answers,
}: EditQuestionAnswerListProps): JSX.Element => {
  const interval = 5;
  const [page, setPage] = useState<number>(0);
  const router = useRouter();
  return (
    <>
      <Stack alignItems="stretch">
        <Stack>
          <TableContainer component={Paper} style={{ height: "400px" }}>
            <Table size="small" aria-label="purchases">
              <TableHead>
                <TableRow>
                  <TableCell align="center">IDCC</TableCell>
                  <TableCell>Convention Collective</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {answers
                  ?.slice(page * interval, (page + 1) * interval)
                  ?.map((answer) => {
                    return (
                      <TableRow key={answer.agreement.id}>
                        <TableCell scope="row">{answer.agreement.id}</TableCell>
                        <TableCell scope="row">
                          {answer.agreement.name}
                        </TableCell>
                        <TableCell scope="row" align="center">
                          {answer.status && (
                            <StatusContainer status={answer.status} />
                          )}
                        </TableCell>
                        <TableCell scope="row">
                          <IconButton
                            aria-label="modifier"
                            size="small"
                            color="primary"
                            onClick={() => {
                              router.push(
                                `/contributions/answers/${answer.id}`
                              );
                            }}
                          >
                            <ModeEditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
        <Stack alignItems="end">
          <Pagination
            page={page}
            totalPage={answers.length}
            interval={5}
            onPageChange={(page) => {
              console.log(router);
              // router.push(`${router.asPath}?page=${page}`);
              setPage(page);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
