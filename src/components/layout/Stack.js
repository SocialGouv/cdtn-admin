/** @jsx jsx */
import PropTypes from "prop-types";
import { jsx } from "theme-ui";

export function Stack({ gap = "medium", ...props }) {
  return (
    <div
      {...props}
      sx={{
        display: "grid",
        gridGap: gap,
      }}
    />
  );
}
Stack.propTypes = {
  gap: PropTypes.oneOf([
    "xxsmall",
    "xsmall",
    "small",
    "medium",
    "large",
    "xlarge",
    "xxlarge",
  ]),
};
