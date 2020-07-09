/** @jsx jsx  */

import Link from "next/link";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Layout } from "src/components/layout/auth.layout";
import { jsx, Message, NavLink, Container, Divider } from "theme-ui";
import { useRouter } from "next/router";
import { useQuery } from "urql";
import { useState, useEffect, useMemo } from "react";
import { Accordion } from "@reach/accordion";
import { Tabs, TabItem } from "src/components/tabs";
import { ChangesGroup } from "src/components/changes/ChangeGroup";
import { DiffChange } from "src/components/changes";
import { AlertTitle } from "src/components/alerts/AlertTitle";
import { getStatusLabel } from "src/models";

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
  }) {
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
  const [, initialHash = "todo"] = router.asPath.split("#");
  const [hash, setHash] = useState(initialHash);
  // https://formidable.com/open-source/urql/docs/basics/document-caching/#adding-typenames
  const context = useMemo(() => ({ additionalTypenames: ["alerts"] }), []);

  const repository = router.query.repo.replace(/–/g, "/");
  const [result] = useQuery({
    query: getAlertQuery,
    variables: { repository, status: hash },
    context,
  });

  useEffect(() => {
    function onHashChange(url) {
      const [, hash = "todo"] = url.split("#");
      setHash(hash);
    }

    router.events.on("hashChangeComplete", onHashChange);
    return function () {
      router.events.off("hashChangeComplete", onHashChange);
    };
  });

  const { fetching, error, data } = result;
  if (fetching) {
    return <div>Chargement...</div>;
  }
  if (error) {
    return (
      <Message>
        <pre>{JSON.stringify(error, 0, 2)}</pre>
      </Message>
    );
  }
  const { statuses, alerts } = data;

  function renderChange(change, key) {
    return <DiffChange key={key} change={change} repository={repository} />;
  }

  return (
    <Layout title="Gestion des alertes">
      <Tabs id="statustab">
        {statuses.map((status) => (
          <Link key={status.name} href={`#${status.name}`} passHref>
            <NavLink>
              <TabItem controls="statustab" selected={status.name == hash}>
                {getStatusLabel(status.name)} ({status.alerts.aggregate.count})
              </TabItem>
            </NavLink>
          </Link>
        ))}
      </Tabs>
      {alerts.map((alert) => (
        <Container key={`${alert.info.file}-${alert.ref}`}>
          <AlertTitle alertId={alert.id}>
            IDCC{alert.info.num} -{" "}
            {new Date(alert.created_at).toLocaleDateString()} ({alert.ref})
          </AlertTitle>
          <Accordion collapsible multiple>
            {alert.changes.added.length > 0 && (
              <ChangesGroup
                changes={alert.changes.added}
                label="Éléments ajoutés"
                renderChange={(changes, i) =>
                  renderChange(changes, `${alert.ref}-added-${i}`)
                }
              />
            )}
            {alert.changes.added.length > 0 &&
              alert.changes.modified.length > 0 && <Divider />}
            <ChangesGroup
              changes={alert.changes.modified}
              label="Éléments modifiés"
              renderChange={(changes, i) =>
                renderChange(changes, `${alert.ref}-modified-${i}`)
              }
            />
            {alert.changes.removed.length > 0 && <Divider />}
            <ChangesGroup
              changes={alert.changes.removed}
              label="Éléments supprimés"
              renderChange={(changes, i) =>
                renderChange(changes, `${alert.ref}-removed-${i}`)
              }
            />
          </Accordion>
        </Container>
      ))}
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(AlertPage));
