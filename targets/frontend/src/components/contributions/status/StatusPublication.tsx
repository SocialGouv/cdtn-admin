import { format, parseISO } from "date-fns";
import { Box, Stack, Tooltip } from "@mui/material";

import { Status } from "../type";
import { statusesMapping } from "./data";
import { isPublished } from "../publication";

export const StatusPublicationContainer = ({
  statusDate,
  exportDate,
  displayText = false,
  dataTestid,
}: {
  statusDate?: string;
  exportDate?: string | null;
  displayText?: boolean;
  dataTestid?: string;
}) => {
  let tooltipText: string | undefined;
  let status: Status | undefined;
  if (!exportDate || !statusDate) {
    status = "NOT_PUBLISHED";
    tooltipText = statusesMapping[status].text;
  } else {
    if (isPublished({ statusDate, exportDate })) {
      status = "PUBLISHED";
      tooltipText = `${statusesMapping[status].text} le ${format(
        parseISO(exportDate),
        "dd/MM/yyyy HH:mm:ss"
      )}`;
    } else {
      status = "PUBLISHING";
      tooltipText = statusesMapping[status].text;
    }
  }
  return (
    <Tooltip title={tooltipText}>
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
        {displayText && <Box mt={2}>{tooltipText}</Box>}
      </Stack>
    </Tooltip>
  );
};
