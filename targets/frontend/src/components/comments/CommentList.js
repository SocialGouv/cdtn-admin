import PropTypes from "prop-types";
import { useLayoutEffect, useRef } from "react";
import { Box, Text } from "@mui/material";

import { Stack } from "../layout/Stack";
import { Comment, commentPropTypes } from "./Comment";

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
          <Text as="p" sx={{ color: "muted" }}>
            Aucun commentaire
          </Text>
        )}
      </Stack>
    </Box>
  );
}

CommentList.propTypes = {
  comments: PropTypes.arrayOf(commentPropTypes),
};
