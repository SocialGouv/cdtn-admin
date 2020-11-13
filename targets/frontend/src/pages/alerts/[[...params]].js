/** @jsx jsx  */

import { Accordion } from "@reach/accordion";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { AlertTitle } from "src/components/alerts/AlertTitle";
import { DiffChange } from "src/components/changes";
import { ChangesGroup } from "src/components/changes/ChangeGroup";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { Pagination } from "src/components/pagination";
import { TabItem, Tabs } from "src/components/tabs";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { getStatusLabel } from "src/models";
import { Card, Container, Divider, jsx, Message, NavLink } from "theme-ui";
import { useQuery } from "urql";

const getAlertQuery = `
query getAlerts($status: String!, $repository: String!, $limit: Int!, $offset: Int!) {
  statuses: alert_status {
    name
    alerts: alerts_aggregate(where: {
      repository: {_eq: $repository }
    }) {
      aggregate {
        count
      }
      __typename
    }
  }
  alerts(limit: $limit, offset: $offset, where: {
    _and: [
      {status: {_eq: $status}},
      {repository: {_eq: $repository}},
    ]
  } order_by: [{created_at: desc},{info: asc}]) {
    id
    ref
    info
    changes
    status
    created_at
    __typename
  }
}
`;

export function AlertPage() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const pageSize = 10;

  const [repo, activeStatus = "todo"] = router.query.params;
  const repository = repo.replace(/_/, "/");
  // https://formidable.com/open-source/urql/docs/basics/document-caching/#adding-typenames
  const context = useMemo(() => ({ additionalTypenames: ["alerts"] }), []);
  const [result] = useQuery({
    context,
    query: getAlertQuery,
    variables: {
      limit: pageSize,
      offset,
      repository,
      status: activeStatus,
    },
  });

  const { fetching, error, data } = result;

  if (fetching) {
    return <Layout title="Gestion des alertes">Chargement...</Layout>;
  }
  if (error) {
    return (
      <Layout title="Gestion des alertes">
        <Message>
          <pre>{JSON.stringify(error, 0, 2)}</pre>
        </Message>
      </Layout>
    );
  }
  const { statuses, alerts } = data;

  function renderChange(change, key, type) {
    return <DiffChange key={key} change={change} type={type} />;
  }

  function getTitle(alert) {
    if (alert.info.num) {
      return `IDCC ${alert.info.num} - ${new Date(
        alert.created_at
      ).toLocaleDateString()} (${alert.ref})`;
    } else {
      return `${alert.info.title} - ${new Date(
        alert.created_at
      ).toLocaleDateString()} (${alert.ref})`;
    }
  }
  // console.log(alerts);
  return (
    <Layout title="Gestion des alertes">
      <Tabs id="statustab">
        {statuses.map((status) => (
          <Link
            shallow
            key={status.name}
            as={`/alerts/${repo}/${status.name}`}
            href="/alerts/[[...params]]"
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
      {alerts.map((alert) => (
        <Container sx={{ paddingTop: "large" }} key={`${alert.id}`}>
          <Card>
            <Stack>
              <AlertTitle alertId={alert.id} info={alert.info}>
                {getTitle(alert)}
              </AlertTitle>
              <Accordion collapsible multiple>
                {alert.changes.added.length > 0 && (
                  <ChangesGroup
                    changes={alert.changes.added}
                    label="Éléments ajoutés"
                    renderChange={(changes, i) =>
                      renderChange(
                        changes,
                        `${alert.id}-added-${i}`,
                        alert.info.type
                      )
                    }
                  />
                )}
                {alert.changes.added.length > 0 &&
                  alert.changes.modified.length > 0 && <Divider />}
                <ChangesGroup
                  changes={alert.changes.modified}
                  label="Éléments modifiés"
                  renderChange={(changes, i) =>
                    renderChange(
                      changes,
                      `${alert.id}-modified-${i}`,
                      alert.info.type
                    )
                  }
                />
                {alert.changes.removed.length > 0 && <Divider />}
                <ChangesGroup
                  changes={alert.changes.removed}
                  label="Éléments supprimés"
                  renderChange={(changes, i) =>
                    renderChange(
                      changes,
                      `${alert.id}-removed-${i}`,
                      alert.info.type
                    )
                  }
                />
                {alert.changes.documents?.length > 0 && <Divider />}
                <ChangesGroup
                  changes={alert.changes.documents}
                  label="Contenus liés"
                  renderChange={(item, i) => {
                    const [title, anchor] = item.document.title.split("#");

                    return (
                      <li key={`${alert.id}-documents-${i}`}>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          key={item.document.id}
                          href={`https://code.travail.gouv.fr/${getRouteBySource(
                            item.document.source
                          )}/${slugify(title)}${anchor ? `#${anchor}` : ``}`}
                        >
                          {title}
                        </a>
                      </li>
                    );
                  }}
                />
              </Accordion>
            </Stack>
          </Card>
        </Container>
      ))}
      <Pagination
        count={
          statuses.find(({ name }) => name === activeStatus).alerts.aggregate
            .count
        }
        pageSize={pageSize}
        offset={offset}
        onChange={({ offset }) => setOffset(offset)}
      />
    </Layout>
  );
}
/**
 * This getInitialProps ensure useState to reset while page url change
 * @see https://github.com/vercel/next.js/issues/9992
 */
AlertPage.getInitialProps = async function ({ query }) {
  const [repo, activeStatus = "todo"] = query.params;
  return {
    key: `${repo}/${activeStatus}`,
  };
};

export default withCustomUrqlClient(withUserProvider(AlertPage));
