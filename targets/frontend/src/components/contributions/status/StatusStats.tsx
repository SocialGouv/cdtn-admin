import { Card, Stack, CardContent, Typography } from "@mui/material";
import { statusesMapping } from "./data";

export function getPercentage(count: number, total: number) {
  return ((count / total) * 100).toFixed(2);
}

type StatusCount = {
  status: string;
  count: number;
};

export type StatusStatsResult = {
  statusCounts: StatusCount[];
  total: number;
};

export const StatusStats = ({ statusCounts, total }: StatusStatsResult) => {
  return (
    <>
      {statusCounts.map(({ status, count }) => {
        const { text, color, icon } = statusesMapping[status];
        return (
          <Card key={status}>
            <CardContent sx={{ color, minWidth: "140px" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                spacing={0.5}
              >
                {icon}
                <Typography>{text}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontWeight: "bold" }}>{count}</Typography>
                <span>({getPercentage(count, total)}%)</span>
              </Stack>
            </CardContent>
          </Card>
        );
      })}
    </>
  );
};
