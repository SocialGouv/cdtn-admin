import { AlertColor, Stack } from "@mui/material";
import React, { useState } from "react";
import { BreadcrumbLink } from "src/components/utils";
import {
  setDefaultData,
  useEditInformationMutation,
} from "./editInformation.mutation";
import { InformationsForm } from "./InformationsForm";
import { useRouter } from "next/router";
import { SnackBar } from "src/components/utils/SnackBar";

export const InformationsCreate = (): JSX.Element => {
  const router = useRouter();
  const onUpsert = useEditInformationMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });
  setDefaultData({
    title: "",
    updatedAt: "",
    dismissalProcess: false,
    description: "",
    metaDescription: "",
    metaTitle: "",
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
            onUpsert={async (data) => {
              try {
                await onUpsert(data);
                await router.push(`/informations`);
                setSnack({
                  open: true,
                  severity: "success",
                  message: "La page information a été crée",
                });
              } catch (e: any) {
                setSnack({
                  open: true,
                  severity: "error",
                  message: e.message,
                });
              }
            }}
          ></InformationsForm>
        </Stack>
      </Stack>
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </>
  );
};
