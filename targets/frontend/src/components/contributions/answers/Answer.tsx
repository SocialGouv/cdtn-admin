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
import React, { useEffect, useState } from "react";
import { useUser } from "src/hooks/useUser";

import { StatusContainer } from "../status";
import { Answer, Status } from "../type";
import { useContributionAnswerUpdateMutation } from "./answer.mutation";
import { useContributionAnswerQuery } from "./answer.query";
import { Comments } from "./Comments";
import { statusesMapping } from "../status/data";
import { SnackBar } from "../../utils/SnackBar";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { AnswerForm } from "./AnswerForm";
import { fr } from "@codegouvfr/react-dsfr";
import { usePublishContributionMutation } from "./usePublishAnswer";
import { useGenericContributionAnswerQuery } from "./answerGeneric.query";

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
  const { user } = useUser() as any;
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
      if (newStatus === "PUBLISHED") {
        await onPublish(answer.id);
      }
      setSnack({
        open: true,
        severity: "success",
        message: "La réponse a été modifiée",
      });
    } catch (e: any) {
      // Dans le cas où il y a une erreur au niveau de la publication (PUBLISHED), on revert le status en VALIDATED
      if (newStatus === "PUBLISHED" && answer) {
        await updateAnswer({
          content: data.content,
          id: answer.id,
          contentType: data.contentType,
          status: "VALIDATED",
          userId: user?.id,
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
          <div style={{ color: statusesMapping[answer?.status.status].color }}>
            <StatusContainer status={answer.status} />
          </div>
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
