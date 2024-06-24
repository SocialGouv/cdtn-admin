import {
  AlertColor,
  Box,
  Stack,
  styled,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSession } from "next-auth/react";

import { StatusContainer } from "../status";
import { Answer, Status } from "../type";
import { useContributionAnswerUpdateMutation } from "./answer.mutation";
import { useContributionAnswerQuery } from "./answer.query";
import { Comments } from "./Comments";
import { SnackBar } from "../../utils/SnackBar";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { AnswerForm } from "./AnswerForm";
import { fr } from "@codegouvfr/react-dsfr";
import { usePublishContributionMutation } from "./usePublishAnswer";
import { useGenericContributionAnswerQuery } from "./answerGeneric.query";
import { StatusPublicationContainer } from "../status/StatusPublication";

export type ContributionsAnswerProps = {
  id: string;
};

export const ContributionsAnswer = ({
  id,
}: ContributionsAnswerProps): JSX.Element => {
  const answer = useContributionAnswerQuery({ id });
  const genericAnswer = useGenericContributionAnswerQuery({
    questionId: answer?.questionId,
  });
  const { data } = useSession();
  const user = data?.user;
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });
  const onPublish = usePublishContributionMutation();

  const onSubmit = async (newStatus: Status, data: Answer) => {
    try {
      if (!answer || !answer.id) {
        throw new Error("Id non définit");
      }

      if (!user) {
        throw new Error("Utilisateur non connecté");
      }

      await updateAnswer({
        content: data.content,
        description: data.description,
        id: answer.id,
        contentType: data.contentType,
        status: newStatus,
        userId: user?.id,
        contentServicePublicCdtnId: data.contentFichesSpDocument?.cdtnId,
        messageBlockGenericNoCDT: data.messageBlockGenericNoCDT,
        kaliReferences: data.kaliReferences,
        legiReferences: data.legiReferences,
        cdtnReferences: data.cdtnReferences,
        otherReferences: data.otherReferences,
      });
      if (newStatus === "TO_PUBLISH") {
        await onPublish(answer.id);
      }
      setSnack({
        open: true,
        severity: "success",
        message: "La réponse a été modifiée",
      });
    } catch (e: any) {
      // Dans le cas où il y a une erreur au niveau de la publication (TO_PUBLISH), on revert le status en VALIDATED
      if (newStatus === "TO_PUBLISH" && answer && user) {
        await updateAnswer({
          content: data.content,
          id: answer.id,
          contentType: data.contentType,
          status: "VALIDATED",
          userId: user.id,
          contentServicePublicCdtnId: data.contentFichesSpDocument?.cdtnId,
          kaliReferences: data.kaliReferences,
          legiReferences: data.legiReferences,
          cdtnReferences: data.cdtnReferences,
          otherReferences: data.otherReferences,
        });
      }
      setSnack({ open: true, severity: "error", message: e.message });
    }
  };
  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Breadcrumb>
          <BreadcrumbLink
            href={`/contributions/questions/${answer?.question?.id}`}
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
          <BreadcrumbLink>
            <HtmlTooltip
              title={<Typography>{answer?.agreement?.name}</Typography>}
            >
              <span>{answer?.agreement?.id}</span>
            </HtmlTooltip>
          </BreadcrumbLink>
        </Breadcrumb>
        {answer?.status && (
          <Stack>
            <StatusContainer
              status={answer.status.status}
              exportDate={answer.publication?.export.createdAt}
              statusDate={answer.status.createdAt}
              displayText
            />
            <StatusPublicationContainer
              status={answer.status.status}
              exportDate={answer.publication?.export.createdAt}
              displayText
            />
          </Stack>
        )}
      </Stack>
      <Stack direction="row">
        <Box sx={{ width: "70%" }}>
          {answer && genericAnswer && (
            <AnswerForm
              answer={answer}
              genericAnswerContentType={genericAnswer.contentType}
              onSubmit={onSubmit}
            />
          )}
        </Box>
        <Box sx={{ width: "30%" }}>
          {answer && answer.statuses && (
            <Comments
              answerId={answer.id}
              comments={answer.answerComments ?? []}
              statuses={answer.statuses}
            />
          )}
        </Box>
      </Stack>

      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </>
  );
};

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: fr.colors.decisions.background.default.grey.hover,
    color: fr.colors.decisions.text.default.grey.default,
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
  },
}));
