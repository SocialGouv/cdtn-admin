import {
  Alert,
  AlertColor,
  Breadcrumbs,
  Button,
  FormControl,
  Grid,
  Snackbar,
  Stack,
} from "@mui/material";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "src/hooks/useUser";

import { FormEditionField, FormRadioGroup } from "../../forms";
import { StatusContainer } from "../status";
import { statusesMapping } from "../status/data";
import { Status } from "../type";
import {
  MutationProps,
  useContributionAnswerUpdateMutation,
} from "./Answer.mutation";
import { useContributionAnswerQuery } from "./Answer.query";

export type ContributionsAnswerProps = {
  id: string;
};

export const ContributionsAnswer = ({
  id,
}: ContributionsAnswerProps): JSX.Element => {
  const answer = useContributionAnswerQuery({ id });
  const { user } = useUser() as any;
  const [status, setStatus] = useState<Status>("REDACTING");
  useEffect(() => {
    if (answer?.statuses?.[0]?.status) {
      setStatus(answer?.statuses[0].status);
    }
  }, [answer]);
  const { control, handleSubmit, watch } = useForm<MutationProps>({
    defaultValues: {
      content: answer?.content ?? "",
      otherAnswer: "ANSWER",
    },
  });
  const otherAnswer = watch("otherAnswer", answer?.otherAnswer);
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    text?: string;
  }>({
    open: false,
  });
  const onSubmit = async (data: MutationProps) => {
    try {
      if (!answer?.id) {
        throw new Error("Id non définit");
      }
      await updateAnswer({
        content: data.content,
        id: answer.id,
        otherAnswer: data.otherAnswer,
        status,
        userId: user?.id,
      });
      setSnack({ open: true, severity: "success", text: "success" });
    } catch (e: any) {
      setSnack({ open: true, severity: "error", text: e.message });
    }
  };
  return (
    <>
      <Grid container>
        <Grid xs={10}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href={"/contributions"}>Contributions</Link>
            <Link href={`/contributions/questions/${answer?.question.id}`}>
              {answer?.question?.content}
            </Link>
            <div>{answer?.agreement?.id}</div>
          </Breadcrumbs>
        </Grid>
        <Grid xs={2} style={{ color: statusesMapping[status].color }}>
          <StatusContainer
            status={status}
            user={answer?.statuses?.[0]?.user?.name}
          />
        </Grid>
      </Grid>
      <h2>{answer?.agreement?.name}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <FormControl>
            <FormEditionField
              label="Réponse"
              name="content"
              disabled={status !== "REDACTING"}
              control={control}
              rules={{ required: otherAnswer === "ANSWER" }}
            />
          </FormControl>
          <FormControl>
            <FormRadioGroup
              label="Type de réponse"
              name="otherAnswer"
              control={control}
              disabled={status !== "REDACTING"}
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
          <Stack
            direction="row"
            alignItems="end"
            justifyContent="end"
            spacing={2}
            padding={2}
          >
            <Button
              variant="contained"
              type="submit"
              onClick={() => setStatus("REDACTING")}
            >
              {status === "REDACTING" && "Sauvegarder"}
              {status === "REDACTED" && "Modifier"}
              {status === "VALIDATING" && "Refuser"}
              {status === "VALIDATED" && "Modifier"}
              {status === "PUBLISHED" && "Modifier"}
            </Button>
            <Button
              variant="contained"
              color="success"
              type="submit"
              style={{ display: status === "PUBLISHED" ? "none" : "inherit" }}
              onClick={() => {
                switch (status) {
                  case "REDACTING":
                    setStatus("REDACTED");
                    break;
                  case "REDACTED":
                    setStatus("VALIDATING");
                    break;
                  case "VALIDATING":
                    setStatus("VALIDATED");
                    break;
                  case "VALIDATED":
                    setStatus("PUBLISHED");
                    break;
                }
              }}
            >
              {status === "REDACTING" && "Soumettre"}
              {status === "REDACTED" && "Commencer Validation"}
              {status === "VALIDATING" && "Valider"}
              {status === "VALIDATED" && "Publier"}
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
          >
            {snack?.text}
          </Alert>
        </Snackbar>
      </form>
    </>
  );
};
