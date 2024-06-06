import { format, parseISO } from "date-fns";
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
}: {
  status: Status;
  statusDate?: string;
  exportDate?: string;
  displayText?: boolean;
  dataTestid?: string;
}) => {
  let tooltipDate = exportDate
    ? format(parseISO(exportDate), "dd/MM/yyyy HH:mm:ss")
    : "";
  const tooltipTitle = !statusDate ? tooltipDate : statusesMapping[status].text;
  if (statusDate && exportDate && status === "PUBLISHED") {
    status = isPublished({ statusDate, exportDate })
      ? "PUBLISHED"
      : "TO_PUBLISH";
  }
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
