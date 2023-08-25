import { Box } from "@mui/material";

import { spacePropTypes } from "./spaces";
import { theme } from "src/theme";

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
