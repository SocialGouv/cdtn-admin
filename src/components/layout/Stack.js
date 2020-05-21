/** @jsx jsx */
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
