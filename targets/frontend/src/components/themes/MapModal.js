import { useState } from "react";
import { MapIcon } from "../utils/dsfrIcons";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Box } from "@mui/material";

import { Map } from "./Map";
import { theme } from "../../theme";

export const MapModal = () => {
  const [showThemeMap, setShowThemeMap] = useState(false);

  return (
    <>
      <Box sx={{ justifyContent: "flex-end", display: "flex" }}>
        <Button variant="secondary" onClick={() => setShowThemeMap(true)}>
          <MapIcon
            sx={{
              height: theme.sizes.iconMedium,
              mr: theme.space.small,
              width: theme.sizes.iconMedium,
            }}
          />
          Carte des thèmes
        </Button>
      </Box>
      <Dialog
        isOpen={showThemeMap}
        onDismiss={() => setShowThemeMap(false)}
        aria-label="Carte des thèmes"
        maxWidth="lg"
        fullWidth
      >
        <Box
          sx={{
            maxHeight: "75vh",
            overflow: "auto",
            p: "2rem",
          }}
        >
          <Map setShowThemeMap={setShowThemeMap} />
        </Box>
      </Dialog>
    </>
  );
};
