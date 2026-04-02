import { Alert, Skeleton, Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { useSelectNewsQuery } from "./news.query";
import React from "react";
import { useNewsUpdateMutation } from "./news.mutation";
import { usePublishMutation } from "../../../documents/components/publish.mutation";
import { NewsForm } from "../Common";

type Props = {
  id: string;
};

export const NewsEdition = ({ id }: Props): React.ReactElement => {
  const { data, fetching, error, reexecuteQuery } = useSelectNewsQuery({
    id,
  });
  const update = useNewsUpdateMutation();
  const publish = usePublishMutation();

  if (error) {
    return (
      <Alert severity="error">
        Erreur lors de la récupération de l&apos;actualité.
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
    return <Alert severity="error">Cette actualité n&apos;existe plus.</Alert>;
  }

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/news"}>Actualités</BreadcrumbLink>
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
          <NewsForm
            news={data}
            onUpsert={async (props) => {
              await update(props);
              reexecuteQuery({ requestPolicy: "network-only" });
            }}
            onPublish={async () => {
              if (data?.id) {
                await publish({ id: data.id, source: "actualites" });
              } else {
                throw new Error("Aucune actualité à publier n'a été détectée");
              }
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
