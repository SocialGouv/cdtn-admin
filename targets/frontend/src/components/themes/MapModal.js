/** @jsxImportSource theme-ui */

import { useState } from "react";
import { IoMdMap } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Box, Flex } from "theme-ui";

import { Map } from "./Map";

export const MapModal = () => {
  const [showThemeMap, setShowThemeMap] = useState(false);

  return (
    <>
      <Flex sx={{ justifyContent: "flex-end" }}>
        <Button variant="secondary" onClick={() => setShowThemeMap(true)}>
          <IoMdMap
            sx={{ height: "iconMedium", mr: "small", width: "iconMedium" }}
          />
          Carte des thèmes
        </Button>
      </Flex>
      <Dialog
        isOpen={showThemeMap}
        onDismiss={() => setShowThemeMap(false)}
        aria-label="Carte des thèmes"
        sx={{
          left: "50%",
          margin: 0,
          maxHeight: "90vh",
          padding: 0,
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
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
