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
import {
  CdtnReference,
  KaliReference,
  LegiReference,
  OtherReference,
  Status,
} from "../type";
import { useContributionAnswerUpdateMutation } from "./Answer.mutation";
import { useContributionAnswerQuery } from "./Answer.query";
import { Comments } from "./Comments";
import {
  CdtnReferenceInput,
  KaliReferenceInput,
  LegiReferenceInput,
  OtherReferenceInput,
} from "./references";

export type ContributionsAnswerProps = {
  id: string;
};

type AnswerForm = {
  otherAnswer?: string;
  content?: string;
  kaliReferences?: KaliReference[];
  legiReferences?: LegiReference[];
  otherReferences?: OtherReference[];
  cdtnReferences?: CdtnReference[];
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
  const { control, handleSubmit, watch } = useForm<AnswerForm>({
    defaultValues: {
      content: answer?.content ?? "",
      otherAnswer: answer?.otherAnswer ?? "ANSWER",
      kaliReferences:
        answer?.kali_references?.map((item) => item.kali_article) ?? [],
      legiReferences:
        answer?.legi_references?.map((item) => item.legi_article) ?? [],
      cdtnReferences:
        answer?.cdtn_references?.map((item) => item.document) ?? [],
      otherReferences: answer?.other_references ?? [],
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

      await updateAnswer({
        content: data.content,
        id: answer.id,
        otherAnswer: data.otherAnswer,
        status,
        userId: user?.id,
        kali_references:
          data.kaliReferences?.map((ref) => ({
            answer_id: answer.id,
            article_id: ref.id,
          })) ?? [],
        legi_references:
          data.legiReferences?.map((ref) => ({
            answer_id: answer.id,
            article_id: ref.id,
          })) ?? [],
        cdtn_references:
          data.cdtnReferences?.map((ref) => ({
            answer_id: answer.id,
            cdtn_id: ref.cdtn_id,
          })) ?? [],
        other_references:
          data.otherReferences?.map((ref) => ({
            answer_id: answer.id,
            label: ref.label,
            url: ref.url,
          })) ?? [],
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
                  disabled={
                    answer?.status !== "REDACTING" && answer?.status !== "TODO"
                  }
                />
              )}
              <LegiReferenceInput
                name="legiReferences"
                control={control}
                disabled={
                  answer?.status !== "REDACTING" && answer?.status !== "TODO"
                }
              />
              <OtherReferenceInput
                name="otherReferences"
                control={control}
                disabled={
                  answer?.status !== "REDACTING" && answer?.status !== "TODO"
                }
              />
              <CdtnReferenceInput
                name="cdtnReferences"
                control={control}
                disabled={
                  answer?.status !== "REDACTING" && answer?.status !== "TODO"
                }
              />
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
