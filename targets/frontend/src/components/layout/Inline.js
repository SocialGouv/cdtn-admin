import PropTypes from "prop-types";
import React from "react";
import { Box } from "@mui/material";

import { invertSpace, spacePropTypes } from "./spaces";

export function Inline({
  space = "medium",
  component = "div",
  children,
  ...props
}) {
  const negativeSpace = invertSpace(space);
  const isList = /^(ul|ol)$/.test(component);
  const inlineItemComponent = isList ? "li" : "div";
  return (
    <Box
      {...props}
      as={component}
      sx={{ alignItems: "center", flexWrap: "wrap", display: "flex" }}
      marginLeft={negativeSpace}
      marginTop={negativeSpace}
    >
      {React.Children.map(children, (child) => (
        <Box
          as={inlineItemComponent}
          minWidth={0}
          paddingLeft={space}
          paddingTop={space}
        >
          {child}
        </Box>
      ))}
    </Box>
  );
}
Inline.propTypes = {
  children: PropTypes.node,
  component: PropTypes.oneOf(["div", "ul", "ol"]),
  space: spacePropTypes,
};
