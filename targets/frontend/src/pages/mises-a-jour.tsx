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
import { useUser } from "src/hooks/useUser";
import { Environment, useExportEsStore } from "src/store/export-es";
import { Badge, Message, Spinner } from "theme-ui";

export function UpdatePage(): JSX.Element {
  const exportStore = useExportEsStore((state) => ({
    ...state,
  }));

  const { getExportEs } = useExportEsStore((state) => ({
    getExportEs: state.getExportEs,
  }));

  const { user }: any = useUser();

  const onTrigger = (env: Environment) => exportStore.runExportEs(env, user.id);

  useEffect(() => {
    getExportEs();
  }, [getExportEs]);

  return (
    <Layout title="Mises à jour des environnements">
      <Stack>
        {exportStore.error && (
          <Stack>
            <Message>
              <pre>{JSON.stringify(exportStore.error, null, 2)}</pre>
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
            isDisabled={exportStore.isRunning}
            status={exportStore.lastStatusPreproduction}
            onClick={() => onTrigger(Environment.preproduction)}
          >
            Mettre à jour la production
          </TriggerButton>
          <TriggerButton
            variant="secondary"
            isDisabled={exportStore.isRunning}
            status={exportStore.lastStatusProduction}
            onClick={() => onTrigger(Environment.production)}
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
          {exportStore.isGetExportLoading && (
            <tbody>
              <tr>
                <td colSpan={5}>
                  <Spinner />
                </td>
              </tr>
            </tbody>
          )}
          <tbody>
            {exportStore.exportData.map(
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
