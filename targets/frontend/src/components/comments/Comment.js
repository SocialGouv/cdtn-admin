/** jsxImportSource theme-ui */
import PropTypes from "prop-types";
import { Box } from "theme-ui";

export function Comment({ comment }) {
  return (
    <Box sx={{ alignItems: "center" }}>
      <Box>
        <b sx={{ color: "secondary" }}>{comment.user.name}</b>{" "}
        <span sx={{ color: "muted" }}>
          {new Date(comment.createdAt).toLocaleDateString()}
        </span>
      </Box>
      <p sx={{ margin: 0, padding: 0 }}>{comment.text}</p>
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
