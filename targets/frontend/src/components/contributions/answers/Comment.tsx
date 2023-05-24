import { Box } from "@mui/material";
import * as React from "react";
import useFormattedDate from "src/hooks/useFormattedDate";

import { Comments as AnswerComments } from "../type";

type Props = {
  comment: AnswerComments;
};

export const Comment = ({ comment }: Props) => {
  const date = useFormattedDate(comment.createdAt); // to avoid error about date format on hydration

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
        <Box sx={{ color: "#6e6d6d", fontSize: "small" }}>{date}</Box>
      </Box>
      <Box sx={{ marginTop: 1, whiteSpace: "pre-line" }}>{comment.content}</Box>
    </Box>
  );
};
