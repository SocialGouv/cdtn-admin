import { Environment } from "@shared/types";
import { useEffect } from "react";
import {
  EnvironmentBadge,
  Status,
  TriggerButton,
} from "src/components/export-es";
import { Layout } from "src/components/layout/auth.layout";
import { Inline } from "src/components/layout/Inline";
import { Stack } from "src/components/layout/Stack";
import { Table, Td, Th, Tr } from "src/components/table";
import { withCustomUrqlClient } from "src/hoc/CustomUrqlClient";
import { withUserProvider } from "src/hoc/UserProvider";
import { useExportEs } from "src/hooks/exportEs";
import { useUser } from "src/hooks/useUser";
import { Badge, Message, Spinner } from "theme-ui";

export function UpdatePage(): JSX.Element {
  const [exportEsState, getExportEs, runExportEs] = useExportEs();

  const { user }: any = useUser();

  const onTrigger = (env: Environment) => runExportEs(env, user.id);

  useEffect(() => {
    getExportEs();
  }, []);

  return (
    <Layout title="Mises à jour des environnements">
      <Stack>
        {exportEsState.error && (
          <Stack>
            <Message>
              <pre>{JSON.stringify(exportEsState.error, null, 2)}</pre>
            </Message>
          </Stack>
        )}
        <p>
          Cette page permet de mettre à jour les données des environnements de{" "}
          <Badge as="span" variant="accent">
            production
          </Badge>{" "}
          et{" "}
          <Badge as="span" variant="secondary">
            pre-production
          </Badge>{" "}
          et de suivre l’état de ces mises à jour.
        </p>
      </Stack>
      <Stack>
        <Inline>
          <TriggerButton
            variant="accent"
            isDisabled={false}
            status={exportEsState.latestExportProduction?.status}
            onClick={() => onTrigger(Environment.production)}
          >
            Mettre à jour la production
          </TriggerButton>
          <TriggerButton
            variant="secondary"
            isDisabled={false}
            status={exportEsState.latestExportPreproduction?.status}
            onClick={() => onTrigger(Environment.preproduction)}
          >
            Mettre à jour la pre-production
          </TriggerButton>
        </Inline>

        <Table>
          <thead>
            <Tr>
              <Th align="left">Environnement</Th>
              <Th align="left">Utilisateur</Th>
              <Th align="left">Crée le</Th>
              <Th align="left">Complété le</Th>
              <Th align="left">Statut</Th>
            </Tr>
          </thead>
          {exportEsState.isGetExportLoading && (
            <tbody>
              <tr>
                <td colSpan={5}>
                  <Spinner />
                </td>
              </tr>
            </tbody>
          )}
          <tbody>
            {exportEsState.exportData.map(
              ({
                id,
                environment,
                created_at,
                updated_at,
                user,
                status,
              }: any) => {
                return (
                  <Tr key={`${id}`}>
                    <Td>
                      <EnvironmentBadge environment={environment} />
                    </Td>
                    <Td>{user.name}</Td>
                    <Td>
                      {new Date(created_at).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(created_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      {new Date(updated_at).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(updated_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Td>
                    <Td>
                      <Status status={status} />
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

export default withCustomUrqlClient(withUserProvider(UpdatePage));
