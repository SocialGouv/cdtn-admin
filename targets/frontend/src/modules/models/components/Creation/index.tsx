import { Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import React, { useState } from "react";
import { generateInitialId } from "@shared/utils";
import { ModelForm } from "src/modules/models/components/Common";
import { useRouter } from "next/router";
import { useModelInsertMutation } from "src/modules/models/components/Creation/model.mutation";

export const ModelCreation = (): React.ReactElement => {
  const router = useRouter();
  const update = useModelInsertMutation();
  // Généré une fois pour toutes : un envoi répété retombe sur le même modèle.
  const [modelId] = useState(generateInitialId);

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/models"}>Modèles de documents</BreadcrumbLink>
      <BreadcrumbLink>
        Création d&apos;un nouveau modèle de document
      </BreadcrumbLink>
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
            onUpsert={async (props) => {
              const { id } = await update({ ...props, id: modelId });
              router.push(`/models/${id}`);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
