import { Box, Stack, Tooltip } from "@mui/material";

import { Status } from "../type";
import { statusesMapping } from "./data";
import { isPublished } from "../publication";

export const StatusContainer = ({
  status,
  statusDate,
  exportDate,
  displayText = false,
  dataTestid,
  center = false,
}: {
  status: Status;
  statusDate?: string;
  exportDate?: string | null;
  displayText?: boolean;
  dataTestid?: string;
  center?: boolean;
}) => {
  if (status === "TO_PUBLISH") {
    if (statusDate && exportDate && isPublished({ statusDate, exportDate })) {
      status = "TO_PUBLISH";
    } else {
      status = "PUBLISHING";
    }
  }
  const tooltipTitle = statusesMapping[status].text;
  return (
    <Tooltip title={tooltipTitle}>
      <Stack
        direction="row"
        style={{
          color: statusesMapping[status].color,
        }}
        alignItems="center"
        justifyContent={center ? "center" : "flex-start"}
        spacing={1}
        data-testid={dataTestid}
      >
        {statusesMapping[status].icon}
        {displayText && <Box mt={2}>{tooltipTitle}</Box>}
      </Stack>
    </Tooltip>
  );
};
