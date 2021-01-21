import PropTypes from "prop-types";
import React from "react";
import { Box, Flex } from "theme-ui";

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
    <Flex
      {...props}
      as={component}
      sx={{ alignItems: "center", flexWrap: "wrap" }}
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
    </Flex>
  );
}
Inline.propTypes = {
  children: PropTypes.node,
  component: PropTypes.oneOf(["div", "ul", "ol"]),
  space: spacePropTypes,
};
