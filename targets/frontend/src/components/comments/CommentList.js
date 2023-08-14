import PropTypes from "prop-types";
import { useLayoutEffect, useRef } from "react";
import { Box } from "@mui/material";

import { Stack } from "../layout/Stack";
import { Comment, commentPropTypes } from "./Comment";
import { theme } from "src/theme";

export function CommentList({ comments }) {
  const scrollContainer = useRef();
  useLayoutEffect(() => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTop = scrollContainer.current.scrollHeight;
    }
  });
  return (
    <Box
      ref={scrollContainer}
      sx={{ maxHeight: "200px", overflow: "hidden", overflowY: "auto" }}
    >
      <Stack>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))
        ) : (
          <p sx={{ color: theme.colors.muted }}>Aucun commentaire</p>
        )}
      </Stack>
    </Box>
  );
}

CommentList.propTypes = {
  comments: PropTypes.arrayOf(commentPropTypes),
};
