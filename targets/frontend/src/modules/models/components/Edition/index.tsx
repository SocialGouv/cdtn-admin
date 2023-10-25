import { Alert, Skeleton, Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { useListModelQuery } from "./model.query";
import React from "react";
import { ModelForm } from "src/modules/models/components/Common";
import { useModelUpdateMutation } from "./model.mutation";
import { usePublishMutation } from "./publish.mutation";

type Props = {
  id: string;
};

export const ModelEdition = ({ id }: Props): React.ReactElement => {
  const { data, fetching, error, reexecuteQuery } = useListModelQuery({ id });
  const update = useModelUpdateMutation();
  const publish = usePublishMutation();

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors de la récupération du modèle de courrier.
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
      <Alert severity="error">Ce modèle de courrier n&apos;existe plus.</Alert>
    );
  }

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/models"}>Modèles de documents</BreadcrumbLink>
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
          <ModelForm
            model={data}
            onUpsert={async (props) => {
              await update(props);
              reexecuteQuery({ requestPolicy: "network-only" });
            }}
            onPublish={async () => {
              if (data?.id) {
                await publish(data.id);
              } else {
                throw new Error(
                  "Aucune modèle de document à publier n'a été détecté"
                );
              }
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
