import PropTypes from "prop-types";
import { useState } from "react";
import { useSelectionContext } from "src/pages/contenus";
import { Box, Stack } from "@mui/material";

import { Button } from "../button";
import { Dialog } from "../dialog";

export function DocumentsListActions({ onUpdatePublication }) {
  const [selectedItems] = useSelectionContext();
  const [showPublishDialog, setPublishDialogVisible] = useState(false);
  const openPublishDialog = () => setPublishDialogVisible(true);
  const closePublishDialog = () => setPublishDialogVisible(false);

  function updatePublication() {
    const docEntries = Object.entries(selectedItems);
    onUpdatePublication(docEntries);
    closePublishDialog();
  }

  return (
    <Box>
      <Dialog
        isOpen={showPublishDialog}
        onDismiss={closePublishDialog}
        aria-label="Modifier le statut de publication"
      >
        <Stack>
          <p>
            Êtes vous sûr de vouloir modifier la publication des contenus&nbsp;?
          </p>
          <Recap publications={selectedItems} />
          <Stack direction="row" spacing={2} mt={4} justifyContent="end">
            <Button variant="outlined" onClick={closePublishDialog}>
              Annuler
            </Button>
            <Button variant="contained" onClick={updatePublication}>
              Modifier la publication des contenus
            </Button>
          </Stack>
        </Stack>
      </Dialog>
      <Button
        type="button"
        variant="contained"
        color="success"
        disabled={Object.keys(selectedItems).length === 0}
        onClick={openPublishDialog}
      >
        Sauvegarder
      </Button>
    </Box>
  );
}

DocumentsListActions.propTypes = {
  onUpdatePublication: PropTypes.func.isRequired,
};

function Recap({ publications }) {
  const items = Object.entries(publications).reduce(
    (state, [, published]) => {
      if (published) {
        state.published += 1;
      } else {
        state.unpublished += 1;
      }
      return state;
    },
    { published: 0, unpublished: 0 }
  );
  return (
    <Box>
      <p style={{ fontWeight: "bold" }}>Détails</p>
      <ul>
        {items.published > 0 && (
          <li>
            <strong>{items.published}</strong> éléments à publier
          </li>
        )}
        {items.unpublished > 0 && (
          <li>
            <strong>{items.unpublished}</strong> éléments à dépublier
          </li>
        )}
      </ul>
    </Box>
  );
}

Recap.propTypes = {
  publications: PropTypes.object,
};
