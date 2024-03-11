import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { usePrequalifiedQuery } from "./prequalified.query";
import { PrequalifiedForm } from "./PrequalifiedForm";
import { SnackBar } from "src/components/utils/SnackBar";
import { Prequalified } from "../type";
import { usePrequalifiedUpdateMutation } from "./prequalifiedUpdate.mutation";
import { useState } from "react";
import { AlertColor } from "@mui/material";
import { ConfirmModal } from "src/modules/common/components/modals/ConfirmModal";
import { useDeletePrequalifiedMutation } from "./prequalifiedDelete.mutation";
import { useRouter } from "next/router";

export const PrequalifiedEdition = ({ id }: { id: string }): JSX.Element => {
  const router = useRouter();
  const [modalDelete, setModalDelete] = useState<boolean>(false);
  const onDelete = useDeletePrequalifiedMutation();
  const prequalified = usePrequalifiedQuery({ id });
  const updatePrequalified = usePrequalifiedUpdateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const onSubmit = async (data: Prequalified) => {
    try {
      await updatePrequalified(data);
      setSnack({
        open: true,
        severity: "success",
        message: "La réponse a été modifiée",
      });
    } catch (e: any) {
      setSnack({ open: true, severity: "error", message: e.message });
    }
  };

  return (
    <>
      <Breadcrumb>
        <BreadcrumbLink href={`/prequalified`}>
          <>Liste des requêtes préqualifiés</>
        </BreadcrumbLink>
      </Breadcrumb>
      {prequalified && (
        <PrequalifiedForm
          data={prequalified}
          onSubmit={onSubmit}
          onDelete={async () => {
            setModalDelete(true);
          }}
        ></PrequalifiedForm>
      )}
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
      <ConfirmModal
        open={modalDelete}
        title="Suppression"
        message="Etes-vous sûr de vouloir supprimer cette requête préqualifiée ?"
        onClose={() => setModalDelete(false)}
        onCancel={() => setModalDelete(false)}
        onValidate={async () => {
          if (!prequalified?.id) return;
          await onDelete(prequalified?.id);
          router.push("/prequalified");
        }}
      />
    </>
  );
};
