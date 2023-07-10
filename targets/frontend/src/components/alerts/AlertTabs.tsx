import Link from "next/link";
import PropTypes from "prop-types";
import { getStatusLabel, slugifyRepository } from "src/models";
import { Spinner } from "theme-ui";
import { useQuery } from "urql";

import { TabItem, Tabs } from "../tabs";
import { FixedSnackBar } from "../utils/SnackBar";
import React from "react";

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
  const [result] = useQuery({
    query: countAlertByStatusQuery,
    variables: {
      repository,
    },
  });

  const { fetching, error, data } = result;

  if (fetching) {
    return <Spinner />;
  }

  if (error) {
    return (
      <FixedSnackBar>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </FixedSnackBar>
    );
  }

  return (
    <Tabs id="statustab">
      {data.statuses.map((status: any) => (
        <Link
          shallow
          key={status.name}
          href={`/alerts/${slugifyRepository(repository)}/${status.name}`}
          passHref
          style={{ textDecoration: "none" }}
        >
          <TabItem controls="statustab" selected={status.name === activeStatus}>
            {getStatusLabel(status.name)} ({status.alerts.aggregate.count})
          </TabItem>
        </Link>
      ))}
    </Tabs>
  );
}

AlertTabs.propTypes = {
  activeStatus: PropTypes.string.isRequired,
  repository: PropTypes.string.isRequired,
};
