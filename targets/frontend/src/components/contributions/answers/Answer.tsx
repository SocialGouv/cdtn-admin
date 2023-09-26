import {
  AlertColor,
  Box,
  Button,
  FormControl,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUser } from "src/hooks/useUser";

import { FormEditionField, FormRadioGroup, FormTextField } from "../../forms";
import { StatusContainer } from "../status";
import { Answer, Status } from "../type";
import { useContributionAnswerUpdateMutation } from "./answer.mutation";
import { useContributionAnswerQuery } from "./answer.query";
import { Comments } from "./Comments";
import {
  CdtnReferenceInput,
  KaliReferenceInput,
  LegiReferenceInput,
  OtherReferenceInput,
} from "./references";
import { statusesMapping } from "../status/data";
import { getNextStatus, getPrimaryButtonLabel } from "../status/utils";
import { SnackBar } from "../../utils/SnackBar";
import { FicheSpReferenceInput } from "./references/FicheSpReferenceInput";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";

export type ContributionsAnswerProps = {
  id: string;
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
      setStatus(answer.status.status);
    }
  }, [answer]);
  const { control, getValues, trigger } = useForm<Answer>({
    values: answer,
    defaultValues: {
      content: "",
      contentType: "ANSWER",
      status: {
        status: "TODO",
      },
      legiReferences: [],
      kaliReferences: [],
      otherReferences: [],
      cdtnReferences: [],
      contentFichesSpReference: answer?.contentFichesSpDocument
        ? {
            document: {},
          }
        : undefined,
    },
  });
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const onSubmit = async (newStatus: Status) => {
    const isValid = await trigger();
    if (!isValid) {
      return setSnack({
        open: true,
        severity: "error",
        message: "Formulaire invalide",
      });
    }

    setStatus(newStatus);
    const data = getValues();

    try {
      if (!answer || !answer.id) {
        throw new Error("Id non définit");
      }

      await updateAnswer({
        content: data.content,
        id: answer.id,
        contentType: data.contentType,
        status: newStatus,
        userId: user?.id,
        contentServicePublicCdtnId:
          data.contentFichesSpReference?.document.cdtnId,
        kaliReferences: data.kaliReferences,
        legiReferences: data.legiReferences,
        cdtnReferences: data.cdtnReferences,
        otherReferences: data.otherReferences,
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

  const agreementResponseOptions = [
    {
      label: "La convention collective ne prévoit rien",
      value: "NOTHING",
    },
    {
      label: "Nous n'avons pas la réponse",
      value: "UNKNOWN",
    },
  ];
  const genericResponseOptions = [
    {
      label: "Utiliser la fiche service public",
      value: "SP",
    },
  ];
  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Breadcrumb>
          <BreadcrumbLink
            href={`/contributions/questions/${answer?.question.id}`}
          >
            <>
              <Typography
                sx={{
                  display: "inline-block",
                  fontSize: "1.4rem",
                  fontWeight: "bold",
                }}
              >
                [{answer?.question?.order}]
              </Typography>{" "}
              {answer?.question?.content}
            </>
          </BreadcrumbLink>
          <BreadcrumbLink>{answer?.agreement?.id}</BreadcrumbLink>
        </Breadcrumb>
        {answer?.status && (
          <div style={{ color: statusesMapping[status].color }}>
            <StatusContainer status={answer.status} />
          </div>
        )}
      </Stack>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <Box sx={{ width: "70%" }}>
          <form
            onSubmit={(e) => {
              // This is a hack to prevent the form from being submitted by the tiptap editor.
              // The details extension is not working properly and submit the form when click on the arrow.
              // See https://github.com/ueberdosis/tiptap/issues/4384
              e.preventDefault();
            }}
          >
            <Stack spacing={5}>
              <FormControl>
                <FormTextField
                  name="updateDate"
                  control={control}
                  label="Date mise à jour"
                  disabled
                  labelFixed
                />
              </FormControl>
              <FormControl>
                <FormEditionField
                  label="Réponse"
                  name="content"
                  disabled={isNotEditable(answer)}
                  control={control}
                  rules={{
                    required: answer && answer.contentType === "ANSWER",
                  }}
                />
              </FormControl>
              {answer && (
                <FormRadioGroup
                  name="contentType"
                  label="Type de réponse"
                  control={control}
                  disabled={isNotEditable(answer)}
                  options={[
                    {
                      label: "Afficher la réponse",
                      value: "ANSWER",
                    },
                    ...(isCodeDuTravail(answer)
                      ? genericResponseOptions
                      : agreementResponseOptions),
                  ]}
                />
              )}
              {answer && isCodeDuTravail(answer) && (
                <FicheSpReferenceInput
                  name="contentFichesSpReference"
                  control={control}
                  disabled={isNotEditable(answer)}
                />
              )}
              {answer && !isCodeDuTravail(answer) && (
                <KaliReferenceInput
                  name="kaliReferences"
                  agreement={answer.agreement}
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
                justifyContent="end"
                spacing={2}
                padding={2}
              >
                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => onSubmit("REDACTING")}
                  disabled={status === "TODO" || status === "REDACTING"}
                >
                  Remettre en rédaction
                </Button>
                <Button
                  variant="text"
                  type="button"
                  disabled={isNotEditable(answer)}
                  onClick={() => onSubmit("REDACTING")}
                >
                  Sauvegarder
                </Button>
                <Button
                  variant="contained"
                  type="button"
                  color="success"
                  onClick={() => onSubmit(getNextStatus(status))}
                  disabled={status === "PUBLISHED"}
                >
                  {getPrimaryButtonLabel(status)}
                </Button>
              </Stack>
            </Stack>

            <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
          </form>
        </Box>
        <Box sx={{ width: "30%" }}>
          {answer && (
            <Comments
              answerId={answer.id}
              comments={answer.answerComments ?? []}
              statuses={answer.statuses}
            />
          )}
        </Box>
      </Box>
    </>
  );
};
