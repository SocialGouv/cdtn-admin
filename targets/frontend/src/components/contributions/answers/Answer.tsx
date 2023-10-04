import {
  AlertColor,
  Box,
  Stack,
  Tooltip,
  TooltipProps,
  Typography,
  styled,
  tooltipClasses,
} from "@mui/material";
import React, { useState } from "react";
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

export type ContributionsAnswerProps = {
  id: string;
};

export const ContributionsAnswer = ({
  id,
}: ContributionsAnswerProps): JSX.Element => {
  const answer = useContributionAnswerQuery({ id });
  const { user } = useUser() as any;
  const updateAnswer = useContributionAnswerUpdateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const onSubmit = async (newStatus: Status, data: Answer) => {
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
        contentServicePublicCdtnId: data.contentFichesSpDocument?.cdtnId,
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
              title={
                <>
                  <Typography color="inherit">
                    {answer?.agreement?.name}
                  </Typography>
                </>
              }
            >
              <Typography>{answer?.agreement?.id}</Typography>
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
          {answer && (
            <AnswerForm answer={answer} onSubmit={onSubmit}></AnswerForm>
          )}
        </Box>
        <Box sx={{ width: "30%" }}>
          {answer?.id && answer?.statuses && (
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
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}));
