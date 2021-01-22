import PropTypes from "prop-types";
import { Box, Text } from "theme-ui";

export function Comment({ comment }) {
  return (
    <Box sx={{ alignItems: "center" }}>
      <Box>
        <Text sx={{ color: "secondary", fontWeight: "600" }}>
          {comment.user.name}
        </Text>{" "}
        <Text sx={{ color: "muted" }}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </Text>
      </Box>
      <Text as="p" m="0" p="0">
        {comment.text}
      </Text>
    </Box>
  );
}

export const commentPropTypes = PropTypes.shape({
  createdAt: PropTypes.string,
  text: PropTypes.string.isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
}).isRequired;

Comment.propTypes = {
  comment: commentPropTypes,
};
