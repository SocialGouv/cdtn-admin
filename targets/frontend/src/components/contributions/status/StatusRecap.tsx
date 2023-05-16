import { Box, Stack } from "@mui/material";

import { Status } from "../type";
import { statusesMapping } from "./data";

export const StatusRecap = (props: {
  todo: number;
  redacting: number;
  redacted: number;
  validating: number;
  validated: number;
  published: number;
}) => {
  return (
    <Stack direction="row" spacing={4} alignItems="end" justifyContent="end">
      {Object.entries(props).map(([key, value]) => {
        const { icon, color } = statusesMapping[key.toUpperCase() as Status];
        return (
          <Stack
            direction="row"
            key={key}
            style={{
              color,
            }}
            spacing={1}
          >
            <Box sx={{ marginTop: "2px" }}>
              <b>{value}</b>
            </Box>
            {icon}
          </Stack>
        );
      })}
    </Stack>
  );
};
