import { Box } from "@mui/material";

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
