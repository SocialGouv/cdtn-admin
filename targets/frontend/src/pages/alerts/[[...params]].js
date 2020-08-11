/** @jsx jsx  */

import { Accordion } from "@reach/accordion";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { AlertTitle } from "src/components/alerts/AlertTitle";
import { DiffChange } from "src/components/changes";
import { ChangesGroup } from "src/components/changes/ChangeGroup";
import { Layout } from "src/components/layout/auth.layout";
import { TabItem, Tabs } from "src/components/tabs";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { getStatusLabel } from "src/models";
import { Container, Divider, jsx, Message, NavLink } from "theme-ui";
import { useQuery } from "urql";

const getAlertQuery = `
query getAlerts($status: String!, $repository: String!) {
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
  alerts(where: {
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

  const [repo, status = "todo"] = router.query.params;
  const repository = repo.replace(/–/, "/");
  console.log({ repository, status });
  // https://formidable.com/open-source/urql/docs/basics/document-caching/#adding-typenames
  const context = useMemo(() => ({ additionalTypenames: ["alerts"] }), []);
  const [result] = useQuery({
    context,
    query: getAlertQuery,
    variables: { repository, status },
  });

  const { fetching, error, data } = result;
  console.log("<AlertPage> render", result, repository, status);

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
  return (
    <Layout title="Gestion des alertes">
      <Tabs id="statustab">
        {statuses.map((status) => (
          <Link
            key={status.name}
            as={`/alerts/${repo}/${status.name}`}
            href="/alerts/[repo]/[status]"
            passHref
          >
            <NavLink>
              <TabItem controls="statustab" selected={status.name === status}>
                {getStatusLabel(status.name)} ({status.alerts.aggregate.count})
              </TabItem>
            </NavLink>
          </Link>
        ))}
      </Tabs>
      {alerts.map((alert) => (
        <Container key={`${alert.id}`}>
          <AlertTitle alertId={alert.id}>{getTitle(alert)}</AlertTitle>
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
                        item.document.type
                      )}/${slugify(title)}${anchor ? `#${anchor}` : ``}`}
                    >
                      {title}
                    </a>
                  </li>
                );
              }}
            />
          </Accordion>
        </Container>
      ))}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(AlertPage));
