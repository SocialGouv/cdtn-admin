/** @jsxImportSource theme-ui */

import PropTypes from "prop-types";

export const Fieldset = ({ children, title, ...props }) => (
  <fieldset
    sx={{
      backgroundColor: "#fdfdfd",
      bordeColor: "text",
      border: "1px solid",
      borderRadius: "small",
      p: "xsmall",
    }}
    {...props}
  >
    <legend
      sx={{
        fontWeight: "bold",
      }}
    >
      {title}
    </legend>
    {children}
  </fieldset>
);

Fieldset.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
};
