import { Box, IconButton } from "@mui/material";
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

export const getCommentText = (comment?: AnswerComments | AnswerStatus) => {
  if (!comment) {
    return "";
  }
  return isAnswerComments(comment)
    ? comment.content
    : `Statut: ${statusesMapping[comment.status].text}`;
};

type Props = {
  comment: CommentsAndStatuses;
  onDelete: (comment: CommentsAndStatuses) => void;
};

export const Comment = ({ comment, onDelete }: Props) => {
  const date = comment.createdAtDate.toLocaleString("fr-FR");

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: "4px",
        display: "flex",
        flexDirection: "column",
        marginBottom: 2,
        padding: 2,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ fontWeight: "bold" }}>{comment?.user?.name}</Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              color: fr.colors.decisions.text.mention.grey.default,
              fontSize: "small",
            }}
          >
            {date}
          </Box>
          {isAnswerComments(comment) && (
            <IconButton
              size="small"
              aria-label="suppression d'un commentaire"
              onClick={() => {
                onDelete(comment);
              }}
            >
              <Delete fontSize="inherit" />
            </IconButton>
          )}
        </Box>
      </Box>
      <Box sx={{ marginTop: 1, whiteSpace: "pre-line" }}>
        {getCommentText(comment)}
      </Box>
    </Box>
  );
};
