import PropTypes from "prop-types";
import { useState } from "react";
import { useSelectionContext } from "src/pages/contenus";
import { Box, Text } from "theme-ui";

import { Button } from "../button";
import { Dialog } from "../dialog";
import { Inline } from "../layout/Inline";
import { Stack } from "../layout/Stack";

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
          <Stack>
            <Text>
              Etes vous sûr de vouloir modifier la publication des
              contenus&nbsp;?
            </Text>
            <Recap publications={selectedItems} />
          </Stack>
          <Inline>
            <Button onClick={updatePublication} size="small">
              Modifier la publication des contenus
            </Button>
            <Button variant="link" onClick={closePublishDialog} size="small">
              Annuler
            </Button>
          </Inline>
        </Stack>
      </Dialog>
      <Button
        type="button"
        outline
        size="small"
        variant="secondary"
        disabled={Object.keys(selectedItems).length === 0}
        onClick={openPublishDialog}
      >
        Modifier
      </Button>

      <pre>{JSON.stringify(selectedItems, 0, 2)}</pre>
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
      <Text sx={{ fontWeight: 600 }}>Détails</Text>
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
