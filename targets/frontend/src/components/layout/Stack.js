import { Box } from "theme-ui";

import { spacePropTypes } from "./spaces";

export function Stack({ gap = "medium", ...props }) {
  return (
    <Box
      {...props}
      sx={{
        display: "grid",
        gridGap: gap,
      }}
    />
  );
}
Stack.propTypes = {
  gap: spacePropTypes,
};
