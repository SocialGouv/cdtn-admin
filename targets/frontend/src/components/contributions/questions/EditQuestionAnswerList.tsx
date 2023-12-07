import {
  Button,
  Checkbox,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Answer } from "../type";
import { StatusContainer } from "../status";
import { useRouter } from "next/router";
import { usePublishContributionMutation } from "../answers/usePublishAnswer";
import { useUser } from "../../../hooks/useUser";
import { useContributionAnswerUpdateStatusMutation } from "../answers/answerStatus.mutation";

type EditQuestionAnswerListProps = {
  answers: Answer[];
};

<<<<<<< Updated upstream:targets/frontend/src/components/contributions/questions/EditQuestionAnswerList.tsx
export const EditQuestionAnswerList = ({
=======
type AnswerCheck = {
  [id: string]: boolean;
};

export const QuestionAnswerList = ({
>>>>>>> Stashed changes:targets/frontend/src/components/contributions/questions/QuestionAnswerList.tsx
  answers,
}: EditQuestionAnswerListProps): JSX.Element => {
  const router = useRouter();
  const [answersCheck, setAnswersCheck] = useState<AnswerCheck>(
    answers.reduce(
      (obj, { id, status }) => ({
        ...obj,
        ...(status.status === "VALIDATED" ? { [id]: false } : {}),
      }),
      {}
    )
  );
  const [displayPublish, setDisplayPublish] = useState(false);
  const onPublish = usePublishContributionMutation();
  const { user } = useUser() as any;
  const updateAnswerStatus = useContributionAnswerUpdateStatusMutation();
  const publishAll = async () => {
    const allPromises = Object.entries(answersCheck)
      .filter(([, checked]) => {
        return checked;
      })
      .map(async ([id]) => {
        const result = await onPublish(id);
        await updateAnswerStatus({
          id: id,
          status: "PUBLISHED",
          userId: user?.id,
        });
        return result;
      });
    await Promise.all(allPromises);
  };
  const redirectToAnswer = (id: string) => {
    router.push(`/contributions/answers/${id}`);
  };
  useEffect(() => {
    const atLeastOneChecked = Object.values(answersCheck).some(
      (checked) => checked
    );
    setDisplayPublish(atLeastOneChecked);
  }, [answersCheck]);
  return (
    <Stack alignItems="stretch">
      <Stack>
        <Stack direction="row" alignItems="start" spacing={2}>
          <Button
            variant="contained"
            type="button"
            color="success"
            disabled={!displayPublish}
            onClick={publishAll}
          >
            Publier
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table size="small" aria-label="purchases">
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Checkbox
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setAnswersCheck(
                        Object.keys(answersCheck).reduce<AnswerCheck>(
                          (obj, key) => ({
                            ...obj,
                            [key]: event.target.checked,
                          }),
                          {}
                        )
                      )
                    }
                  />
                </TableCell>
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
                  >
                    <TableCell scope="row">
                      <Checkbox
                        checked={answersCheck[answer.id]}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) =>
                          setAnswersCheck({
                            ...answersCheck,
                            [answer.id]: event.target.checked,
                          })
                        }
                        disabled={answer.status.status !== "VALIDATED"}
                      />
                    </TableCell>
                    <TableCell
                      scope="row"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
                      {answer?.agreement?.id}
                    </TableCell>
                    <TableCell
                      scope="row"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
                      {answer?.agreement?.name}
                    </TableCell>
                    <TableCell
                      scope="row"
                      align="center"
                      onClick={() => redirectToAnswer(answer.id)}
                    >
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
