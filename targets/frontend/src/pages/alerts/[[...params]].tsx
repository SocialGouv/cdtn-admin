import { Accordion } from "@reach/accordion";
import { HasuraAlert } from "@shared/types";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { AlertTabs } from "src/components/alerts/AlertTabs";
import { AlertTitle } from "src/components/alerts/AlertTitle";
import {
  AddedChanges,
  AlertRelatedDocuments,
  ChangesGroup,
  ModifiedChanges,
  RemovedChanges,
} from "src/components/changes/ChangeGroup";
import { Layout } from "src/components/layout/auth.layout";
import { Stack } from "src/components/layout/Stack";
import { Pagination } from "src/components/pagination";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import type { AlertStatusType } from "src/models";
import { alertStatusWordings } from "src/models";
import { useQuery } from "urql";
import { Card, CardContent, Container } from "@mui/material";
import { FixedSnackBar } from "../../components/utils/SnackBar";
import { theme } from "src/theme";
import { AlertWarning } from "../../components/alerts/warning/AlertWarning";

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
type HasuraAlertNoUpdate = Omit<HasuraAlert, "updated_at">;
type AlertsResultWithCount = {
  alerts: HasuraAlertNoUpdate[];
  alerts_aggregate: {
    aggregate: {
      count: number;
    };
  };
};

export function AlertPage(): JSX.Element {
  const router = useRouter();
  const currentPage = Array.isArray(router.query.page)
    ? 0
    : parseInt(router.query.page ?? "0", 10) ?? 0;
  const pageSize = 10;
  const [repo = "", activeStatus = "todo"] = Array.isArray(router.query.params)
    ? router.query.params
    : [];
  const repository: string = repo.replace(/_/, "/");

  // https://formidable.com/open-source/urql/docs/basics/document-caching/#adding-typenames
  const context = useMemo(() => ({ additionalTypenames: ["alerts"] }), []);

  const [result] = useQuery<AlertsResultWithCount>({
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
  if (error || !data) {
    return (
      <Layout title="Gestion des alertes">
        <FixedSnackBar>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </FixedSnackBar>
      </Layout>
    );
  }

  const { alerts_aggregate, alerts } = data;

  function getTitle(alert: HasuraAlertNoUpdate) {
    if (alert.changes.type === "dila" && alert.changes.num) {
      return (
        <span title={alert.changes.title}>
          IDCC {alert.changes.num}
          <IoIosInformationCircleOutline
            style={{
              height: theme.sizes.iconsXSmall,
              marginLeft: "0.1rem",
              marginRight: "0.1rem",
              width: theme.sizes.iconsXSmall,
              verticalAlign: "super",
            }}
          />
          - {new Date(alert.created_at).toLocaleDateString()} ({alert.ref})
        </span>
      );
    } else {
      return (
        <>
          {alert.changes.title} -{" "}
          {new Date(alert.created_at).toLocaleDateString()} ({alert.ref})
        </>
      );
    }
  }

  return (
    <Layout title="Gestion des alertes">
      <Stack>
        <p style={{ fontSize: theme.fontSizes.small }}>
          Les modifications des textes officiels (code du travail, conventions
          collective) sont analysé afin de produire des alertes afin de
          faciliter le travail de veille. Ces alertes sont à classer en fonction
          de leur impact sur nos contenus.
        </p>
        <AlertWarning repository={repository} />
        <AlertTabs repository={repository} activeStatus={activeStatus} />
        <small>{alertStatusWordings[activeStatus as AlertStatusType]}</small>
        {alerts.map((alert) => {
          const openIndices = [];
          // Pre-open documents panel If there are documents targeted by the alert
          if (
            alert.changes.documents.length > 0 &&
            alert.changes.type === "dila"
          ) {
            openIndices.push(0);
          }

          const accordionItems = [];
          if (
            alert.changes.documents.length > 0 &&
            alert.changes.type === "dila"
          ) {
            accordionItems.push(
              <ChangesGroup label="Contenus liés">
                <AlertRelatedDocuments changes={alert.changes} />
              </ChangesGroup>
            );
          }
          if (alert.changes.added.length > 0) {
            accordionItems.push(
              <ChangesGroup label="Éléments ajoutés">
                <AddedChanges changes={alert.changes} />
              </ChangesGroup>
            );
          }
          if (alert.changes.modified.length > 0) {
            accordionItems.push(
              <ChangesGroup label="Éléments modifiés">
                <ModifiedChanges changes={alert.changes} />
              </ChangesGroup>
            );
          }
          if (alert.changes.removed.length > 0) {
            accordionItems.push(
              <ChangesGroup label="Éléments supprimés">
                <RemovedChanges changes={alert.changes} />
              </ChangesGroup>
            );
          }

          return (
            <Container sx={{ paddingTop: "large" }} key={`${alert.id}`}>
              <Card>
                <CardContent>
                  <Stack>
                    <AlertTitle alertId={alert.id} info={alert.changes}>
                      {getTitle(alert)}
                    </AlertTitle>
                    <Accordion
                      collapsible
                      multiple
                      defaultIndex={openIndices}
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      {accordionItems}
                    </Accordion>
                  </Stack>
                </CardContent>
              </Card>
            </Container>
          );
        })}
        <Pagination
          // @ts-ignore
          count={alerts_aggregate.aggregate.count}
          currentPage={currentPage}
          pageSize={pageSize}
        />
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(AlertPage));
