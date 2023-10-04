import { AlertColor, Skeleton, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Breadcrumb, BreadcrumbLink } from "src/components/utils";

import { useInformationsQuery } from "./Informations.query";
import {
  setDefaultData,
  useEditInformationMutation,
} from "./editInformation.mutation";
import { InformationsForm } from "./InformationsForm";
import { useDeleteInformationMutation } from "./deleteInformation.mutation";
import { usePublishInformationMutation } from "./publishInformation.mutation";
import { useRouter } from "next/router";
import { SnackBar } from "src/components/utils/SnackBar";
import { ConfirmModal } from "src/modules/common/components/modals/ConfirmModal";

export type EditInformationProps = {
  id?: string;
};

export const InformationsEdit = ({ id }: EditInformationProps): JSX.Element => {
  const { data, fetching } = useInformationsQuery({ id });
  const router = useRouter();

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const onUpsert = useEditInformationMutation();
  const onDelete = useDeleteInformationMutation();
  const onPublish = usePublishInformationMutation();

  useEffect(() => {
    if (!fetching && data) {
      setDefaultData(data);
    }
  }, [fetching]);

  if (!data) {
    return (
      <>
        <Skeleton />
      </>
    );
  }

  const Header = () => (
    <Breadcrumb>
      <BreadcrumbLink href={"/informations"}>Informations</BreadcrumbLink>
      <BreadcrumbLink>{data?.title}</BreadcrumbLink>
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
          {!fetching && (
            <InformationsForm
              data={data}
              onDelete={async () => {
                setModalDelete(true);
              }}
              onUpsert={async (data) => {
                try {
                  const id = await onUpsert(data);
                  await router.push(`/informations/${id}`);
                  setSnack({
                    open: true,
                    severity: "success",
                    message: "La page information a été modifiée",
                  });
                } catch (e: any) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: e.message,
                  });
                }
              }}
              onPublish={async () => {
                try {
                  if (data?.id) {
                    await onPublish(data.id);
                    setSnack({
                      open: true,
                      severity: "success",
                      message: "La page information a été publiée",
                    });
                  }
                } catch (e: any) {
                  setSnack({
                    open: true,
                    severity: "error",
                    message: e.message,
                  });
                }
              }}
            ></InformationsForm>
          )}
        </Stack>
        <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
        <ConfirmModal
          open={modalDelete}
          title="Suppression"
          message="Etes-vous sûr de vouloir supprimer cette page d'information ?"
          onClose={() => setModalDelete(false)}
          onCancel={() => setModalDelete(false)}
          onValidate={async () => {
            if (!data?.id) return;
            await onDelete(data?.id);
            router.push("/informations");
          }}
        />
      </Stack>
    </>
  );
};
