import { Box, Stack, Tooltip } from "@mui/material";

import { Status } from "../type";
import { statusesMapping } from "./data";

export const StatusContainer = ({
  status,
  displayText = false,
  dataTestid,
}: {
  status: Status;
  displayText?: boolean;
  dataTestid?: string;
}) => {
  const tooltipTitle = statusesMapping[status].text;
  return (
    <Tooltip title={tooltipTitle}>
      <Stack
        direction="row"
        style={{
          color: statusesMapping[status].color,
        }}
        alignItems="center"
        justifyContent="center"
        spacing={1}
        data-testid={dataTestid}
      >
        {statusesMapping[status].icon}
        {displayText && <Box mt={2}>{tooltipTitle}</Box>}
      </Stack>
    </Tooltip>
  );
};
