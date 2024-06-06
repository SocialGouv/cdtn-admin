import { Box, Stack, Tooltip } from "@mui/material";

import { AnswerStatus, ExportStatus } from "../type";
import { statusesMapping } from "./data";
import { isPublished } from "../publication";

export const StatusContainer = ({
  status,
  exportStatus,
  dataTestid,
}: {
  status: AnswerStatus;
  exportStatus?: ExportStatus;
  dataTestid?: string;
}) => {
  if (status.status === "PUBLISHED") {
    status.status = isPublished({status, exportStatus}) ? "PUBLISHED" : "TO_PUBLISH"
  }
  return (
    <Tooltip title={status.user?.name && `Par ${status.user.name}`}>
      <Stack
        direction="row"
        style={{
          color: statusesMapping[status.status].color,
        }}
        alignItems="center"
        justifyContent="center"
        spacing={1}
        data-testid={dataTestid}
      >
        {statusesMapping[status.status].icon}
        <Box mt={2}>{statusesMapping[status.status].text}</Box>
      </Stack>
    </Tooltip>
  );
};
