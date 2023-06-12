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
  key: string;
}) => {
  return (
    <Stack
      key={props.key}
      direction="row"
      spacing={4}
      alignItems="end"
      justifyContent="end"
    >
      {Object.entries(props).map(([status, value]) => {
        const { icon, color } = statusesMapping[status.toUpperCase() as Status];
        if (!value) return <></>;
        return (
          <Stack
            key={`${props.key}-${status}`}
            direction="row"
            style={{ color }}
            spacing={1}
          >
            {icon}
            <Box>
              <strong>{value}</strong>
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
};
