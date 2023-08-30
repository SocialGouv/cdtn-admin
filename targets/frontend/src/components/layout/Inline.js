import PropTypes from "prop-types";
import React from "react";
import { Box } from "@mui/material";

import { spacePropTypes } from "./spaces";
import { theme } from "src/theme";

export function Inline({ component = "div", children, ...props }) {
  const isList = /^(ul|ol)$/.test(component);
  const inlineItemComponent = isList ? "li" : "div";
  return (
    <Box
      {...props}
      as={component}
      sx={{
        alignItems: "center",
        display: "flex",
        gap: "8px",
        flexDirection: "row",
      }}
    >
      {React.Children.map(children, (child) => (
        <Box
          as={inlineItemComponent}
          style={{
            minWidth: 0,
          }}
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
