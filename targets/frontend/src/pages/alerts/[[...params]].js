/** jsxImportSource theme-ui */
import { Accordion } from "@reach/accordion";
import slugify from "@socialgouv/cdtn-slugify";
import { getRouteBySource } from "@socialgouv/cdtn-sources";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { AlertTabs } from "src/components/alerts/AlertTabs";
import { AlertTitle } from "src/components/alerts/AlertTitle";
import { DiffChange } from "src/components/changes";
import { ChangesGroup } from "src/components/changes/ChangeGroup";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { Pagination } from "src/components/pagination";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Card, Container, Divider, Message } from "theme-ui";
import { useQuery } from "urql";

const getAlertQuery = `
query getAlerts($status: String!, $repository: String!, $limit: Int!, $offset: Int!) {
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
  }
  alerts_aggregate(
    where: {
      _and: {
        status: {_eq: $status},
        repository: {_eq: $repository},
      }
    }
  )
  {
    aggregate { count }
  }
}
`;

export function AlertPage() {
  const router = useRouter();
  const currentPage = parseInt(router.query.page, 10) || 0;

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
      offset: currentPage * pageSize,
      repository,
      status: activeStatus,
    },
  });

  const { fetching, error, data } = result;

  if (fetching) {
    return (
      <Layout title="Gestion des alertes">
        <AlertTabs repository={repository} activeStatus={activeStatus} />
        Chargement...
      </Layout>
    );
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
  const { alerts_aggregate, alerts } = data;

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
      <Stack>
        <AlertTabs repository={repository} activeStatus={activeStatus} />
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
          count={alerts_aggregate.aggregate.count}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </Stack>
    </Layout>
  );
}
/**
 * This getInitialProps ensure useState to reset while page url change
 * @see https://github.com/vercel/next.js/issues/9992
 */
// AlertPage.getInitialProps = async function ({ query }) {
//   const [repo, activeStatus = "todo"] = query.params;
//   return {
//     key: `${repo}/${activeStatus}`,
//   };
// };

export default withCustomUrqlClient(withUserProvider(AlertPage));
