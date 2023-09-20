import { Stack } from "@mui/material";
import React from "react";
import { BreadcrumbLink } from "src/components/utils";
import {
  setDefaultData,
  useEditInformationMutation,
} from "./editInformation.mutation";
import { InformationsForm } from "./InformationsForm";
import { useDeleteInformationMutation } from "./deleteInformation.mutation";
import { useRouter } from "next/router";

export const InformationsCreate = (): JSX.Element => {
  const router = useRouter();
  const onUpsert = useEditInformationMutation();
  const onDelete = useDeleteInformationMutation();
  setDefaultData({
    title: "",
    updatedAt: "",
    references: [],
    contents: [],
  });

  const Header = () => (
    <ol aria-label="breadcrumb" className="fr-breadcrumb__list">
      <BreadcrumbLink href={"/informations"}>Informations</BreadcrumbLink>
      <BreadcrumbLink>creation</BreadcrumbLink>
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
          <InformationsForm
            onDelete={onDelete}
            onUpsert={async (data) => {
              const { id } = await onUpsert(data);
              router.push(`informations/${id}`);
            }}
          ></InformationsForm>
        </Stack>
      </Stack>
    </>
  );
};
