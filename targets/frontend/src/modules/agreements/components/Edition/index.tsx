import { Alert, Skeleton, Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import React from "react";
import { useAgreementUpdateMutation } from "./agreement.mutation";
import { useAgreementQuery } from "./agreement.query";
import { AgreementForm } from "../Common";
import { usePublishMutation } from "./publish.mutation";

type Props = {
  id: string;
};

export const AgreementEdition = ({ id }: Props): React.ReactElement => {
  const { data, fetching, error, reexecuteQuery } = useAgreementQuery({ id });
  const update = useAgreementUpdateMutation();
  const publish = usePublishMutation();

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors de la récupération de la convention collective.
        <p>
          <code>{JSON.stringify(error)}</code>
        </p>
      </Alert>
    );
  }

  if (!data && fetching) {
    return <Skeleton />;
  }

  if (!data) {
    return (
      <Alert severity="error">
        Cette convention collective n&apos;existe plus.
      </Alert>
    );
  }

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/agreements"}>
        Conventions collectives
      </BreadcrumbLink>
      <BreadcrumbLink>{data.name}</BreadcrumbLink>
    </Breadcrumb>
  );

  return (
    <>
      <Stack
        alignItems="stretch"
        direction="column"
        justifyContent="start"
        spacing={2}
      >
        <Header />
        <Stack mt={4} spacing={2}>
          <AgreementForm
            agreement={data}
            onUpsert={async (props) => {
              await update(props);
              reexecuteQuery({ requestPolicy: "network-only" });
            }}
            onPublish={async () => {
              if (data?.id) {
                await publish(data.id);
              } else {
                throw new Error(
                  "Aucune convention collective à publier n'a été détectée"
                );
              }
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
