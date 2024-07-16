import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import * as React from "react";

import {
  AnswerStatus,
  Comments as AnswerComments,
  CommentsAndStatuses,
} from "../type";
import { fr } from "@codegouvfr/react-dsfr";
import { statusesMapping } from "../status/data";
import { Delete } from "@mui/icons-material";

const isAnswerComments = (
  comment: AnswerComments | AnswerStatus
): comment is AnswerComments =>
  (comment as AnswerComments).content !== undefined;

type Props = {
  comment: CommentsAndStatuses;
  onDelete: (comment: AnswerComments) => void;
};

export const Comment = ({ comment, onDelete }: Props) => {
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
        minWidth: "300px",
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
            {date} <strong>{comment.user?.name}</strong>
          </Typography>
        </Tooltip>

        <IconButton
          size="small"
          aria-label="suppression d'un commentaire"
          onClick={() => {
            onDelete(comment);
          }}
        >
          <Delete fontSize="inherit" />
        </IconButton>
      </Box>
      <Typography sx={{ fontSize: "small" }}>{comment.content}</Typography>
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
