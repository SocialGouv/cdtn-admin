/** @jsxImportSource theme-ui */

import { useMemo } from "react";
import { GitlabButton } from "src/components/button/GitlabButton";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { EnvironementBadge } from "src/components/pipelines/EnvironmentBadge";
import {
  getPipelineStatusLabel,
  Status,
} from "src/components/pipelines/Status";
import { Table, Td, Th, Tr } from "src/components/table";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { Badge, Message, Spinner } from "theme-ui";
import { useQuery } from "urql";

export const getDataUpdateQuery = `
query getPipelines {
  pipelines(order_by: {created_at: desc}, limit: 50) {
    id
    pipelineId: pipeline_id 
    createdAt: created_at
    environment
    status
    user {
      name
    }
  }
}
`;

type Pipelines = {
  id: string;
  user: {
    name: string;
  };
  environment: string;
  status: string;
  pipelineId: string;
  createdAt: Date;
};

export type DataUpdateResult = {
  pipelines: Pipelines[];
};

function isActivePipeline(status: string) {
  return ["created", "pending", "running"].includes(status);
}
export function EvironementPage(): JSX.Element {
  // use context to update table after trigger pipeline button
  const context = useMemo(
    () => ({ additionalTypenames: ["pipelines", "UpdatePipelineOutput"] }),
    []
  );

  const [result] = useQuery<DataUpdateResult>({
    context,
    query: getDataUpdateQuery,
    requestPolicy: "cache-and-network",
  });

  const { data, fetching, error } = result;

  if (error) {
    return (
      <Layout title="Contenus dupliqués">
        <Stack>
          <Message>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </Message>
        </Stack>
      </Layout>
    );
  }

  const isPreprodPending =
    data?.pipelines.some(
      (event) =>
        isActivePipeline(event.status) && event.environment === "preprod"
    ) ?? false;
  const isProdPending =
    data?.pipelines.some(
      (event) => isActivePipeline(event.status) && event.environment === "prod"
    ) ?? false;

  return (
    <Layout title="Mises à jour des environnements ">
      <Stack>
        <p>
          Cette page permet de mettre à jour les données des environements de{" "}
          <Badge as="span" variant="accent">
            prod
          </Badge>{" "}
          et{" "}
          <Badge as="span" variant="secondary">
            preprod
          </Badge>{" "}
          et de suivre l’état de ces mises à jour.
        </p>
      </Stack>
      <Stack>
        <Inline>
          <GitlabButton
            environment="prod"
            variant="accent"
            pending={isProdPending}
          >
            Mettre à jour la prod
          </GitlabButton>

          <GitlabButton
            environment="preprod"
            variant="secondary"
            pending={isPreprodPending}
          >
            Mettre à jour la preprod
          </GitlabButton>
        </Inline>

        <Table>
          <thead>
            <Tr>
              <Th align="left">Environement</Th>
              <Th align="left">Utilisateur</Th>
              <Th align="left">Date</Th>
              <Th align="left">Status</Th>
            </Tr>
          </thead>
          {!data && fetching && (
            <tbody>
              <tr>
                <td colSpan={4}>
                  <Spinner />
                </td>
              </tr>
            </tbody>
          )}
          <tbody>
            {result?.data?.pipelines.map(
              ({ id, pipelineId, environment, user, createdAt, status }) => {
                return (
                  <Tr key={`${id}`}>
                    <Td>
                      <EnvironementBadge environment={environment} />
                    </Td>
                    <Td>{user.name}</Td>
                    <Td>
                      {new Date(createdAt).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(createdAt).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      {status === "created" ||
                      status === "pending" ||
                      status === "running" ? (
                        <Status
                          initialStatus={status}
                          pipelineId={pipelineId}
                        />
                      ) : (
                        getPipelineStatusLabel(status)
                      )}
                    </Td>
                  </Tr>
                );
              }
            )}
          </tbody>
        </Table>
      </Stack>
    </Layout>
  );
}

export default withCustomUrqlClient(withUserProvider(EvironementPage));
