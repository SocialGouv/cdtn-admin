import PropTypes from "prop-types";
import { Box } from "@mui/material";

export function Comment({ comment }) {
  return (
    <Box sx={{ alignItems: "center" }}>
      <Box>
        <p className="fr-text--heavy" style={{ margin: 0, padding: 0 }}>
          {comment.user.name}
        </p>{" "}
        <p
          className="fr-text--light"
          style={{ margin: 0, padding: 0, marginTop: "1px" }}
        >
          {new Date(comment.createdAt).toLocaleDateString()}
        </p>
      </Box>
      <p style={{ margin: 0, padding: 0, marginTop: "3px" }}>{comment.text}</p>
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
