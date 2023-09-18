import { Box } from "@mui/material";
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

const getText = (comment: AnswerComments | AnswerStatus) =>
  isAnswerComments(comment)
    ? comment.content
    : `Changement de statut: ${statusesMapping[comment.status].text}`;

type Props = {
  comment: CommentsAndStatuses;
};

export const Comment = ({ comment }: Props) => {
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
        <Box sx={{ fontWeight: "bold" }}>{comment.user.name}</Box>
        <Box
          sx={{
            color: fr.colors.decisions.text.mention.grey.default,
            fontSize: "small",
          }}
        >
          {date}
        </Box>
      </Box>
      <Box sx={{ marginTop: 1, whiteSpace: "pre-line" }}>
        {getText(comment)}
      </Box>
    </Box>
  );
};
