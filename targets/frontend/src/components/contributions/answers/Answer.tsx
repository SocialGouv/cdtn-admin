import {
  Alert,
  AlertColor,
  Box,
  Breadcrumbs,
  Button,
  FormControl,
  Snackbar,
  Stack,
} from "@mui/material";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

import { FormEditionField, FormRadioGroup } from "../../forms";
import {
  MutationProps,
  useContributionAnswerUpdateMutation,
} from "./Answer.mutation";
import { useContributionAnswerQuery } from "./Answer.query";
import { Comments } from "./Comments";

export type ContributionsAnswerProps = {
  questionId: string;
  agreementId: string;
};

export const ContributionsAnswer = ({
  questionId,
  agreementId,
}: ContributionsAnswerProps): JSX.Element => {
  const answer = useContributionAnswerQuery({ agreementId, questionId });
  const { control, handleSubmit } = useForm<MutationProps>({
    defaultValues: {
      content: answer?.content ?? "",
      otherAnswer: "ANSWER",
    },
  });
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{ open: boolean; severity?: AlertColor }>({
    open: false,
  });
  const onSubmit = async (data: MutationProps) => {
    try {
      await updateAnswer({
        agreementId: data.agreementId,
        content: data.content,
        otherAnswer: data.otherAnswer,
        questionId: data.questionId,
        status: "DONE",
      });
      setSnack({ open: true, severity: "success" });
    } catch (e) {
      setSnack({ open: true, severity: "error" });
    }
  };
  return (
    <>
      <Breadcrumbs aria-label="breadcrumb">
        <Link href={"/contributions"}>Contributions</Link>
        <Link href={`/contributions/${questionId}`}>
          {answer?.question?.content}
        </Link>
        <div>{answer?.agreement?.id}</div>
      </Breadcrumbs>
      <h2>{answer?.agreement?.name}</h2>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box sx={{ width: "70%" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              <FormControl>
                <FormEditionField
                  label="Réponse"
                  name="content"
                  control={control}
                />
              </FormControl>
              <FormControl>
                <FormRadioGroup
                  label="Type de réponse"
                  name="otherAnswer"
                  control={control}
                  options={[
                    {
                      label: "Afficher la réponse",
                      value: "ANSWER",
                    },
                    {
                      label: "La convention collective ne prévoit rien",
                      value: "NOTHING",
                    },
                    {
                      label: "Nous n'avons pas la réponse",
                      value: "UNKNOWN",
                    },
                  ]}
                />
              </FormControl>
              <Stack alignItems="end" padding={2}>
                <Button variant="contained" type="submit">
                  Sauvegarder
                </Button>
              </Stack>
            </Stack>

            <Snackbar
              open={snack.open}
              autoHideDuration={6000}
              onClose={() => setSnack({ open: false })}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Alert
                onClose={() => setSnack({ open: false })}
                severity={snack.severity}
                sx={{ width: "100%" }}
              >
                {snack?.severity}
              </Alert>
            </Snackbar>
          </form>
        </Box>
        <Box sx={{ width: "30%" }}>
          {answer && (
            <Comments
              answerId={answer.id}
              comments={answer.answer_comments ?? []}
            />
          )}
        </Box>
      </Box>
    </>
  );
};
