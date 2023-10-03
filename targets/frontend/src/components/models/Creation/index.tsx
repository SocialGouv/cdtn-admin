import { Stack } from "@mui/material";
import { BreadcrumbLink } from "src/components/utils";
import React from "react";
import { ModelForm } from "src/components/models/Common";
import { useRouter } from "next/router";
import { useModelInsertMutation } from "src/components/models/Creation/model.mutation";

export const ModelCreation = (): React.ReactElement => {
  const router = useRouter();
  const update = useModelInsertMutation();

  const Header = () => (
    <ol aria-label="breadcrumb" className="fr-breadcrumb__list">
      <BreadcrumbLink href={"/modeles"}>Modèles de courrier</BreadcrumbLink>
      <BreadcrumbLink>
        Création d&apos;un nouveau modèle de document
      </BreadcrumbLink>
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
            onUpsert={async (props) => {
              const { id } = await update(props);
              router.push(`/models/${id}`);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
