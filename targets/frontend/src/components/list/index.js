import PropTypes from "prop-types";
import { Box } from "theme-ui";

export function List({ className, children }) {
  return (
    <Box as="ul" className={className} m="0" px="0">
      {children}
    </Box>
  );
}

List.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export function Li({ children }) {
  return (
    <Box as="li" sx={{ listStyle: "none" }}>
      {children}
    </Box>
  );
}

Li.propTypes = {
  children: PropTypes.node,
};
