import { format, parseISO } from "date-fns";
import { Box, Stack, Tooltip } from "@mui/material";

import { Status } from "../type";
import { statusesMapping } from "./data";

export const StatusPublicationContainer = ({
  status,
  exportDate,
  displayText = false,
  dataTestid,
  center = false,
}: {
  status: Status;
  exportDate?: string | null;
  displayText?: boolean;
  dataTestid?: string;
  center?: boolean;
}) => {
  let tooltipText: string | undefined;
  if (!exportDate) {
    status = "NOT_PUBLISHED";
    tooltipText = statusesMapping[status].text;
  } else {
    status = "PUBLISHED";
    tooltipText = `${statusesMapping[status].text} le ${format(
      parseISO(exportDate),
      "dd/MM/yyyy HH:mm:ss"
    )}`;
  }
  return (
    <Tooltip title={tooltipText}>
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
        {displayText && <Box mt={2}>{tooltipText}</Box>}
      </Stack>
    </Tooltip>
  );
};
