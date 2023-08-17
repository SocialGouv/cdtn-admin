import PropTypes from "prop-types";
import { theme } from "src/theme";

export const Fieldset = ({ children, title, ...props }) => (
  <fieldset
    sx={{
      backgroundColor: "#fdfdfd",
      bordeColor: theme.colors.text,
      border: "1px solid",
      borderRadius: theme.space.xsmall,
      padding: theme.space.xsmall,
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
