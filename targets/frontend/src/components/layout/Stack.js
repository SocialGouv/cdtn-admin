import { Box } from "@mui/material";

import { theme } from "src/theme";

const spacePropTypes = PropTypes.oneOfType([
  PropTypes.oneOf(spaces),
  PropTypes.arrayOf(PropTypes.oneOf(spaces)),
]);

export function Stack({ gap = theme.space.medium, ...props }) {
  return (
    <Box
      {...props}
      style={{
        display: "grid",
        gridGap: gap,
      }}
    />
  );
}
Stack.propTypes = {
  gap: spacePropTypes,
};
