import Link from "next/link";
import PropTypes from "prop-types";
import { getStatusLabel, slugifyRepository } from "src/models";
import { Message, NavLink, Spinner } from "theme-ui";
import { useQuery } from "urql";

import { TabItem, Tabs } from "../tabs";

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

export function AlertTabs({ repository, activeStatus }) {
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
    console.error(error);
    return <Message>{error}</Message>;
  }

  return (
    <Tabs id="statustab">
      {data.statuses.map((status) => (
        <Link
          shallow
          key={status.name}
          href={`/alerts/${slugifyRepository(repository)}/${status.name}`}
          passHref
        >
          <NavLink>
            <TabItem
              controls="statustab"
              selected={status.name === activeStatus}
            >
              {getStatusLabel(status.name)} ({status.alerts.aggregate.count})
            </TabItem>
          </NavLink>
        </Link>
      ))}
    </Tabs>
  );
}

AlertTabs.propTypes = {
  activeStatus: PropTypes.string.isRequired,
  repository: PropTypes.string.isRequired,
};
