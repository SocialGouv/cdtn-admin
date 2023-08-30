import { useContext, useState } from "react";
import { SelectionContext } from "src/pages/contenus/fiches-sp";
import { Box } from "@mui/material";

import { Button } from "../button";
import { Dialog } from "../dialog";
import { Inline } from "../layout/Inline";
import { Stack } from "../layout/Stack";

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
        <Stack>
          <Stack>
            <p>
              Êtes vous sûr de vouloir supprimer {selectedItems.length} fiches?
            </p>
          </Stack>
          <Inline>
            <Button onClick={deleteAction} size="small">
              Supprimer les fiches
            </Button>
            <Button variant="text" onClick={closeDeleteDialog} size="small">
              Annuler
            </Button>
          </Inline>
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
