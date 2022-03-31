import { MdOpenInNew } from "react-icons/md";
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
import { Badge, Message, NavLink, Spinner } from "theme-ui";

type EnvironmentPageProps = {
  error: any;
  data: any;
  result: any;
};

export function UpdatePage(props: EnvironmentPageProps): JSX.Element {
  const onTrigger = (env: string) => {
    console.log("triggered");
  };

  const { error, data, result } = props;
  if (error) {
    return (
      <Layout title="Mises à jour des environnements">
        <Stack>
          <Message>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </Message>
        </Stack>
      </Layout>
    );
  }

  return (
    <Layout title="Mises à jour des environnements">
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
          <TriggerButton
            environment="prod"
            variant="accent"
            isDisabled={true} //to replace
            status="pending"
            onClick={() => onTrigger("preprod")}
          >
            Mettre à jour la prod
          </TriggerButton>

          <TriggerButton
            environment="preprod"
            variant="secondary"
            isDisabled={true} // to replace
            status="pending"
            onClick={() => onTrigger("preprod")}
          >
            Mettre à jour la preprod
          </TriggerButton>
        </Inline>

        <Table>
          <thead>
            <Tr>
              <Th align="left">Environement</Th>
              <Th align="left">Utilisateur</Th>
              <Th align="left">Date</Th>
              <Th align="left">Statut</Th>
              <Th />
            </Tr>
          </thead>
          {!data && (
            <tbody>
              <tr>
                <td colSpan={5}>
                  <Spinner />
                </td>
              </tr>
            </tbody>
          )}
          <tbody>
            {result?.data?.pipelines.map(
              ({
                id,
                pipelineId,
                environment,
                user,
                createdAt,
                status,
              }: any) => {
                return (
                  <Tr key={`${id}`}>
                    <Td>
                      <EnvironmentBadge environment={environment} />
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
                      <Status status={status} />
                    </Td>
                    <Td>
                      <NavLink
                        title={`Voir le détail pipeline ${pipelineId}`}
                        sx={{ fontSize: "xsmall", fontWeight: 300 }}
                        href={`https://gitlab.factory.social.gouv.fr/SocialGouv/cdtn-admin/-/pipelines/${pipelineId}`}
                      >
                        <MdOpenInNew
                          sx={{ mb: "-.2rem" }}
                          size="16"
                          aria-label="voir le pipeline"
                        />
                      </NavLink>
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
