import { Box, Typography, Stack, Tooltip } from "@mui/material";
import * as React from "react";

import {
  AnswerStatus,
  Comments as AnswerComments,
  CommentsAndStatuses,
} from "../type";
import { fr } from "@codegouvfr/react-dsfr";
import { statusesMapping } from "../status/data";

const isAnswerComments = (
  comment: AnswerComments | AnswerStatus
): comment is AnswerComments =>
  (comment as AnswerComments).content !== undefined;

type Props = {
  comment: CommentsAndStatuses;
};

export const Comment = ({ comment }: Props) => {
  const date = comment.createdAtDate.toLocaleString("fr-FR", {
    month: "short",
    day: "numeric",
  });

  const dateFull = comment.createdAtDate.toLocaleString("fr-FR");

  return isAnswerComments(comment) ? (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.300",
      }}
      mt={1}
      mb={1}
      p={1}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Tooltip title={dateFull}>
          <Typography
            sx={{
              color: fr.colors.decisions.text.mention.grey.default,
              fontSize: "small",
            }}
          >
            {date}
          </Typography>
        </Tooltip>

        <Box sx={{ fontSize: "small", fontWeight: "bold" }}>
          {comment?.user?.name}
        </Box>
      </Box>
      <Box sx={{ marginTop: 1, whiteSpace: "pre-line" }}>{comment.content}</Box>
    </Box>
  ) : (
    <Stack direction="row" justifyContent="space-between">
      <Tooltip title={dateFull}>
        <Typography
          sx={{
            color: fr.colors.decisions.text.mention.grey.default,
            fontSize: "small",
          }}
        >
          {date} <strong>{comment.user?.name}</strong>
        </Typography>
      </Tooltip>
      <Typography
        sx={{
          color: statusesMapping[comment.status].color,
          fontSize: "small",
        }}
      >
        {" "}
        {statusesMapping[comment.status].text}
      </Typography>
    </Stack>
  );
};
