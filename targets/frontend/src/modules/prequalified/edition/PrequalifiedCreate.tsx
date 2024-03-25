import { Breadcrumb, BreadcrumbLink } from "src/components/utils";
import { PrequalifiedForm } from "./PrequalifiedForm";
import { SnackBar } from "src/components/utils/SnackBar";
import { Prequalified } from "../type";
import { usePrequalifiedCreateMutation } from "./prequalifiedCreate.mutation";
import { useState } from "react";
import { AlertColor } from "@mui/material";

export const PrequalifiedCreate = (): JSX.Element => {
  const createPrequalified = usePrequalifiedCreateMutation();
  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  const onSubmit = async (data: Prequalified) => {
    try {
      await createPrequalified(data);
      setSnack({
        open: true,
        severity: "success",
        message: "La réponse a été créé",
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
      <PrequalifiedForm onSubmit={onSubmit}></PrequalifiedForm>
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </>
  );
};
