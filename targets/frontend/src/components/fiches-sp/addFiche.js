import { useState } from "react";
import { Box } from "@mui/material";
import { useMutation } from "@urql/next";

import { Button } from "../button";
import { Dialog } from "../dialog";
import { AddFicheSpForm } from "./addFicheForm";

export function AddFiches() {
  const [showAddDialog, setAddDialogVisible] = useState(false);
  const openAddDialog = () => setAddDialogVisible(true);
  const closeAddDialog = () => setAddDialogVisible(false);
  const [, insertFicheMutation] = useMutation(insertFicheServicePublicId);
  const insertFicheSp = (ids) => {
    insertFicheMutation({
      objects: ids.map((id) => ({ id })),
    });
    closeAddDialog();
  };
  return (
    <Box>
      <Button onClick={openAddDialog}>Ajouter des fiches</Button>
      <Dialog
        isOpen={showAddDialog}
        onDismiss={closeAddDialog}
        aria-label="Modifier le statut de publication"
      >
        <AddFicheSpForm onAdd={insertFicheSp} />
      </Dialog>
    </Box>
  );
}

const insertFicheServicePublicId = `
mutation addFichesServicePublic($objects: [service_public_contents_insert_input!]!) {
  fiches: insert_service_public_contents(objects: $objects) {
    affected_rows
    returning {
      id, status
    }
  }
}
`;
