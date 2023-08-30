import { useState } from "react";
import { IoMdMap } from "react-icons/io";
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
          <IoMdMap
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
        style={{
          margin: 0,
          maxHeight: "90vh",
          padding: 0,
          width: "75%",
          right: "10px",
          top: "80px",
          position: "absolute",
        }}
      >
        <Box
          sx={{
            maxHeight: "90vh",
            maxWidth: "100%",
            overflow: "scroll",
          }}
          p="2rem"
        >
          <Map setShowThemeMap={setShowThemeMap} />
        </Box>
      </Dialog>
    </>
  );
};
