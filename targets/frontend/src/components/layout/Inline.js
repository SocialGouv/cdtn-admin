/** @jsx jsx  */

import PropTypes from "prop-types";
import { jsx, Box, Flex } from "theme-ui";
import { spacePropTypes, invertSpace } from "./spaces";
import React from "react";

export function Inline({ space = "medium", component = "div", children }) {
  const negativeSpace = invertSpace(space);
  const isList = /^(ul|ol)$/.test(component);
  const inlineItemComponent = isList ? "li" : "div";
  return (
    <Flex
      as={component}
      sx={{ flexWrap: "wrap", alignItems: "center" }}
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
  space: spacePropTypes,
  component: PropTypes.oneOf(["div", "ul", "ol"]),
  children: PropTypes.node,
};
