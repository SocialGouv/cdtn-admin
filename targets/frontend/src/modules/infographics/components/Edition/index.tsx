import { Alert, Skeleton, Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { useListInfographicQuery } from "./infographic.query";
import React from "react";
import { useModelUpdateMutation } from "./infographic.mutation";
import { usePublishMutation } from "../../../documents/components/publish.mutation";
import { InfographicForm } from "../Common";

type Props = {
  id: string;
};

export const InfographicEdition = ({ id }: Props): React.ReactElement => {
  const { data, fetching, error, reexecuteQuery } = useListInfographicQuery({
    id,
  });
  const update = useModelUpdateMutation();
  const publish = usePublishMutation();

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors de la récupération de l@apos;infographie.
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
      <Alert severity="error">Cette infographie n&apos;existe plus.</Alert>
    );
  }

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/infographics"}>Infographies</BreadcrumbLink>
      <BreadcrumbLink>{data.title}</BreadcrumbLink>
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
          <InfographicForm
            infographic={data}
            onUpsert={async (props) => {
              await update(props);
              reexecuteQuery({ requestPolicy: "network-only" });
            }}
            onPublish={async () => {
              if (data?.id) {
                await publish({ id: data.id, source: "infographics" });
              } else {
                throw new Error(
                  "Aucune infographie à publier n'a été détectée",
                );
              }
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
