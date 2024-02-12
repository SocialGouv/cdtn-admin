import { Stack } from "@mui/material";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import React from "react";
import { useRouter } from "next/router";
import { useAgreementInsertMutation } from "./agreement.mutation";
import { AgreementForm } from "../Common";

export const AgreementCreation = (): React.ReactElement => {
  const router = useRouter();
  const update = useAgreementInsertMutation();

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/agreements"}>
        Conventions collectives
      </BreadcrumbLink>
      <BreadcrumbLink>
        Création d&apos;une nouvelle convention collective
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
          <AgreementForm
            onUpsert={async (props) => {
              const { id } = await update(props);
              router.push(`/agreements/${id}`);
            }}
          />
        </Stack>
      </Stack>
    </>
  );
};
