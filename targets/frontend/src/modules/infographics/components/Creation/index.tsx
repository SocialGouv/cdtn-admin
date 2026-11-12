import { Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { generateInitialId } from "@shared/utils";
import { InfographicForm } from "../Common";
import { useInfographicInsertMutation } from "./infographic.mutation";

export const InfographicCreation = (): React.ReactElement => {
  const router = useRouter();
  const insert = useInfographicInsertMutation();
  // Généré une fois pour toutes : un envoi répété retombe sur la même infographie.
  const [infographicId] = useState(generateInitialId);

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/infographics"}>Infographies</BreadcrumbLink>
      <BreadcrumbLink>Création d&apos;une nouvelle infographie</BreadcrumbLink>
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
            onUpsert={async (props) => {
              const { id } = await insert({ ...props, id: infographicId });
              router.push(`/infographics/${id}`);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
