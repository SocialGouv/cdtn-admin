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
import {
  Answer,
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
import { statusesMapping } from "../status/data";
import {
  defaultReferences,
  formatCdtnReferences,
  formatKaliReferences,
  formatLegiReferences,
  formatOtherReferences,
} from "./answerReferences";
import {
  getNextStatus,
  getPrimaryButtonLabel,
  getSecondaryButtonLabel,
} from "../status/utils";

export type ContributionsAnswerProps = {
  id: string;
};

export type AnswerForm = {
  otherAnswer?: string;
  content?: string;
  kaliReferences: KaliReference[];
  legiReferences: LegiReference[];
  otherReferences: OtherReference[];
  cdtnReferences: CdtnReference[];
};

const isNotEditable = (answer: Answer | undefined) =>
  answer?.status.status !== "REDACTING" &&
  answer?.status.status !== "TODO" &&
  answer?.status.status !== "VALIDATING";

const isCodeDuTravail = (answer: Answer): boolean =>
  answer.agreement.id === "0000";

export const ContributionsAnswer = ({
  id,
}: ContributionsAnswerProps): JSX.Element => {
  const answer = useContributionAnswerQuery({ id });
  const { user } = useUser() as any;
  const [status, setStatus] = useState<Status>("TODO");
  useEffect(() => {
    if (answer?.status) {
      setStatus(answer?.status.status);
    }
  }, [answer]);
  const { control, handleSubmit, watch } = useForm<AnswerForm>({
    defaultValues: {
      content: answer?.content ?? "",
      otherAnswer: answer?.otherAnswer ?? "ANSWER",
      ...defaultReferences(answer),
    },
  });
  const otherAnswer = watch("otherAnswer", answer?.otherAnswer);
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });
  const onSubmit = async (data: AnswerForm) => {
    try {
      if (!answer || !answer.id) {
        throw new Error("Id non définit");
      }

      await updateAnswer({
        content: data.content,
        id: answer.id,
        otherAnswer: data.otherAnswer,
        status,
        userId: user?.id,
        kali_references: formatKaliReferences(answer, data),
        legi_references: formatLegiReferences(answer, data),
        cdtn_references: formatCdtnReferences(answer, data),
        other_references: formatOtherReferences(answer, data),
      });
      setSnack({
        open: true,
        severity: "success",
        message: "La réponse a été modifiée",
      });
    } catch (e: any) {
      setSnack({ open: true, severity: "error", message: e.message });
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
        {answer?.status && (
          <Grid xs={2} style={{ color: statusesMapping[status].color }}>
            <StatusContainer status={answer.status} />
          </Grid>
        )}
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
                  disabled={isNotEditable(answer)}
                  control={control}
                  rules={{ required: otherAnswer === "ANSWER" }}
                />
              </FormControl>
              {answer && !isCodeDuTravail(answer) && (
                <FormControl>
                  <FormRadioGroup
                    name="otherAnswer"
                    label="Type de réponse"
                    control={control}
                    disabled={isNotEditable(answer)}
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
              )}
              {answer && !isCodeDuTravail(answer) && (
                <KaliReferenceInput
                  name="kaliReferences"
                  idcc={answer.agreement.id}
                  control={control}
                  disabled={isNotEditable(answer)}
                />
              )}
              <LegiReferenceInput
                name="legiReferences"
                control={control}
                disabled={isNotEditable(answer)}
              />
              <OtherReferenceInput
                name="otherReferences"
                control={control}
                disabled={isNotEditable(answer)}
              />
              <CdtnReferenceInput
                name="cdtnReferences"
                control={control}
                disabled={isNotEditable(answer)}
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
                  {getSecondaryButtonLabel(status)}
                </Button>

                {status !== "PUBLISHED" && (
                  <Button
                    variant="contained"
                    color="success"
                    type="submit"
                    onClick={() => {
                      setStatus(getNextStatus(status));
                    }}
                  >
                    {getPrimaryButtonLabel(status)}
                  </Button>
                )}
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
                {snack?.message}
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
