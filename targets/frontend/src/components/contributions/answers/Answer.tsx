import {
  Alert,
  AlertColor,
  Box,
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
import { Agreement, Answer, AnswerStatus, Question, Status } from "../type";
import {
  MutationProps,
  useContributionAnswerUpdateMutation,
} from "./Answer.mutation";
import { useContributionAnswerQuery } from "./Answer.query";
import { Comments } from "./Comments";
import { KaliReferenceInput } from "./references";
import { CdtnDocumentInput } from "./references/CdtnDocumentInput";
import { LegiReferenceInput } from "./references/LegiReferenceInput";

export type ContributionsAnswerProps = {
  id: string;
};

type AnswerForm = {
  otherAnswer?: string;
  content?: string;
  cdtnDocuments?: string[];
  kaliReferences?: string[];
  legiReferences?: string[];
};

export const ContributionsAnswer = ({
  id,
}: ContributionsAnswerProps): JSX.Element => {
  const answer = useContributionAnswerQuery({ id });
  const { user } = useUser() as any;
  const [status, setStatus] = useState<Status>("TODO");
  useEffect(() => {
    if (answer?.status) {
      setStatus(answer.status);
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
  const onSubmit = async (data: AnswerForm) => {
    try {
      if (!answer?.id) {
        throw new Error("Id non définit");
      }
      const references = data.legiReferences?.map((item) => )
      await updateAnswer({
        content: data.content,
        id: answer.id,
        otherAnswer: data.otherAnswer,
        status,
        userId: user?.id,
      });
      setSnack({
        open: true,
        severity: "success",
        text: "La réponse a été modifiée",
      });
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
            status={answer?.status}
            user={answer?.statuses?.[0]?.user?.name}
          />
        </Grid>
      </Grid>
      <h2>{answer?.agreement?.name}</h2>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box sx={{ width: "70%" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={5}>
              <FormControl>
                <FormEditionField
                  label="Réponse"
                  name="content"
                  disabled={
                    answer?.status !== "REDACTING" && answer?.status !== "TODO"
                  }
                  control={control}
                  rules={{ required: otherAnswer === "ANSWER" }}
                />
              </FormControl>
              <FormControl>
                <FormRadioGroup
                  label="Type de réponse"
                  name="otherAnswer"
                  control={control}
                  disabled={
                    answer?.status !== "REDACTING" && answer?.status !== "TODO"
                  }
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
              {answer?.agreement.id && (
                <KaliReferenceInput
                  name="kaliReferences"
                  idcc={answer?.agreement.id}
                  control={control}
                />
              )}
              <LegiReferenceInput name="legiReferences" control={control} />
              <CdtnDocumentInput name="cdtnDocuments" control={control} />
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
                  {answer?.status === "TODO" && "Sauvegarder"}
                  {answer?.status === "REDACTING" && "Sauvegarder"}
                  {answer?.status === "REDACTED" && "Modifier"}
                  {answer?.status === "VALIDATING" && "Refuser"}
                  {answer?.status === "VALIDATED" && "Modifier"}
                  {answer?.status === "PUBLISHED" && "Modifier"}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  type="submit"
                  style={{
                    display:
                      answer?.status === "PUBLISHED" ? "none" : "inherit",
                  }}
                  onClick={() => {
                    switch (answer?.status) {
                      case "TODO":
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
                  {answer?.status === "TODO" && "Soumettre"}
                  {answer?.status === "REDACTING" && "Soumettre"}
                  {answer?.status === "REDACTED" && "Commencer Validation"}
                  {answer?.status === "VALIDATING" && "Valider"}
                  {answer?.status === "VALIDATED" && "Publier"}
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
