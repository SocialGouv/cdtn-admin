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
    <Tooltip
      title={
        status.user?.name ? `Par ${status.user.name}` : "Réponse à traiter"
      }
    >
      <Stack
        direction="row"
        style={{
          color: statusesMapping[status.status].color,
        }}
        alignItems="end"
        justifyContent="end"
        spacing={1}
        data-testid={dataTestid}
      >
        <Box mt={2}>{statusesMapping[status.status].text}</Box>
        {statusesMapping[status.status].icon}
      </Stack>
    </Tooltip>
  );
};
