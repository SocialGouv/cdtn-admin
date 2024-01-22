import { Box, Stack, Tooltip } from "@mui/material";

import { AnswerStatus } from "../type";
import { statusesMapping } from "./data";

export const StatusContainer = ({
  status,
  dataTestid,
}: {
  status: AnswerStatus;
  dataTestid?: string;
}) => {
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
