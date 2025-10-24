import { Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import React from "react";
import { useRouter } from "next/router";
import { InfographicForm } from "../Common";
import { useInfographicInsertMutation } from "./infographic.mutation";

export const InfographicCreation = (): React.ReactElement => {
  const router = useRouter();
  const insert = useInfographicInsertMutation();

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
              const { id } = await insert(props);
              router.push(`/infographics/${id}`);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
