import PropTypes from "prop-types";
import { getStatusLabel, slugifyRepository } from "src/models";
import CircularProgress from "@mui/material/CircularProgress";
import { useQuery } from "urql";
import { Tabs, Tab } from "@mui/material";

import { FixedSnackBar } from "../utils/SnackBar";
import React from "react";
import { useRouter } from "next/router";

const countAlertByStatusQuery = `
query getAlerts($repository: String!) {
  statuses: alert_status {
    name
    alerts: alerts_aggregate(where: {
      repository: {_eq: $repository }
    }) {
      aggregate {
        count
      }
    }
  }
}
`;

export function AlertTabs({
  repository,
  activeStatus,
}: {
  repository: string;
  activeStatus: string;
}) {
  const router = useRouter();

  const [value, setValue] = React.useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const [result] = useQuery({
    query: countAlertByStatusQuery,
    variables: {
      repository,
    },
  });

  React.useEffect(() => {
    const status = result.data?.statuses.find(
      (statusItem: any) => statusItem.name === activeStatus
    );
    if (status) {
      setValue(result.data?.statuses.indexOf(status));
    }
  }, [result.data, activeStatus]);

  const { fetching, error, data } = result;

  if (fetching) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <FixedSnackBar>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </FixedSnackBar>
    );
  }

  return (
    <Tabs value={value} onChange={handleChange}>
      {data.statuses.map((status: any) => (
        <Tab
          key={status.name}
          label={`${getStatusLabel(status.name)} (${
            status.alerts.aggregate.count
          })`}
          onClick={() => {
            router.push(
              `/alerts/${slugifyRepository(repository)}/${status.name}`,
              undefined,
              { shallow: true }
            );
          }}
        />
      ))}
    </Tabs>
  );
}

AlertTabs.propTypes = {
  activeStatus: PropTypes.string.isRequired,
  repository: PropTypes.string.isRequired,
};
