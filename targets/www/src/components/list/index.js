/** @jsx jsx */
import { jsx } from "theme-ui";
import PropTypes from "prop-types";

export function List({ children }) {
  return <ul sx={{ px: 0 }}>{children}</ul>;
}
List.propTypes = {
  children: PropTypes.node,
};

export function Li({ children }) {
  return <li sx={{ listStyle: "none" }}>{children}</li>;
}
Li.propTypes = {
  children: PropTypes.node,
};
