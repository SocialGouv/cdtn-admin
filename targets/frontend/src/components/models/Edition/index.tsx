import { Skeleton, Stack } from "@mui/material";
import { BreadcrumbLink } from "src/components/utils";
import { useListModelQuery } from "./model.query";
import React from "react";
import { ModelForm } from "src/components/models/Common";
import { useModelUpdateMutation } from "./model.mutation";

type Props = {
  id: string;
};

export const ModelEdition = ({ id }: Props): React.ReactElement => {
  const model = useListModelQuery({ id });
  const update = useModelUpdateMutation();

  if (!model) {
    return (
      <>
        <Skeleton />
      </>
    );
  }

  const Header = () => (
    <ol aria-label="breadcrumb" className="fr-breadcrumb__list">
      <BreadcrumbLink href={"/modeles"}>Modèles de courrier</BreadcrumbLink>
      <BreadcrumbLink>{model.title}</BreadcrumbLink>
    </ol>
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
            model={model}
            onUpsert={async (props) => {
              await update(props);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
