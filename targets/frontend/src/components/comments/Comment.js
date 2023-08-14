import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { theme } from "src/theme";

export function Comment({ comment }) {
  return (
    <Box sx={{ alignItems: "center" }}>
      <Box>
        <p sx={{ color: theme.colors.secondary, fontWeight: "600" }}>
          {comment.user.name}
        </p>{" "}
        <p style={{ color: theme.colors.muted }}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </p>
      </Box>
      <p style={{ margin: 0, padding: 0 }}>{comment.text}</p>
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
