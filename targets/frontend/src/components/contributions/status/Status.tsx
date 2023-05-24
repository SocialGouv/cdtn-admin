import { Box, Stack, Tooltip } from "@mui/material";

import { Status } from "../type";
import { statusesMapping } from "./data";

export const StatusContainer = ({
  status = "TODO",
  user,
  dataTestid,
}: {
  user?: string;
  status?: Status;
  dataTestid?: string;
}) => {
  return (
    <Tooltip title={`Par ${user}`}>
      <Stack
        direction="row"
        style={{
          color: statusesMapping[status].color,
        }}
        alignItems="end"
        justifyContent="end"
        spacing={1}
        data-testid={dataTestid}
      >
        <Box sx={{ marginTop: "2px" }}>{statusesMapping[status].text}</Box>
        {statusesMapping[status].icon}
      </Stack>
    </Tooltip>
  );
};
