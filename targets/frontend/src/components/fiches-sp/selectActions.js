import { useContext, useState } from "react";
import { SelectionContext } from "src/pages/contenus/fiches-sp";
import { Box, Stack } from "@mui/material";

import { Button } from "../button";
import { Dialog } from "../dialog";

export function Actions({ onDelete }) {
  const { selectedItems } = useContext(SelectionContext);
  const [showDeleteDialog, setDeleteDialogVisible] = useState(false);
  const openDeleteDialog = () => setDeleteDialogVisible(true);
  const closeDeleteDialog = () => setDeleteDialogVisible(false);

  function deleteAction() {
    onDelete(selectedItems);
    closeDeleteDialog();
  }

  return (
    <Box>
      <Dialog
        isOpen={showDeleteDialog}
        onDismiss={closeDeleteDialog}
        aria-label="Modifier le statut de publication"
      >
        <Stack spacing={2}>
          <p>
            Êtes vous sûr de vouloir supprimer {selectedItems.length} fiches?
          </p>
          <Stack direction="row" spacing={2} mt={4} justifyContent="end">
            <Button variant="outlined" onClick={closeDeleteDialog}>
              Annuler
            </Button>
            <Button variant="contained" onClick={deleteAction}>
              Supprimer les fiches
            </Button>
          </Stack>
        </Stack>
      </Dialog>
      {selectedItems.length > 0 && (
        <Button
          onClick={openDeleteDialog}
          outline
          size="small"
          variant="secondary"
        >
          Supprimer
        </Button>
      )}
    </Box>
  );
}
