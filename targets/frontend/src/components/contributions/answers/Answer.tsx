import {
  Alert,
  AlertColor,
  Breadcrumbs,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Snackbar,
  Stack,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import styled from "styled-components";

import { FormEditionField, FormRadioGroup } from "../../forms";
import {
  MutationProps,
  useContributionAnswerUpdateMutation,
} from "./Answer.mutation";
import { useContributionAnswerQuery } from "./Answer.query";

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
  // const [data, setData] = useState(answer);
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{ open: boolean; severity?: AlertColor }>({
    open: false,
  });
  // useEffect(() => {
  //   setData(answer);
  // }, [answer]);
  // if (!data || !data.questionId || !data.agreementId) {
  //   return <></>;
  // }
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
    </>
  );
};
