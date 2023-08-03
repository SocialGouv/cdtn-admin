import micromark from "micromark";
import PropTypes from "prop-types";
import { useState } from "react";
import { IoIosEye } from "react-icons/io";

import { Button } from "../button";
import { Dialog } from "../dialog";
import Box from "@mui/material/Box";

export type MarkdownPreviewModalProps = { markdown: string };

export const MarkdownPreviewModal = ({
  markdown,
}: MarkdownPreviewModalProps) => {
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  return (
    <>
      <div>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "2rem" }}>
          <Button
            type="button"
            variant="secondary"
            size="small"
            onClick={() => setShowMarkdownPreview(true)}
          >
            <IoIosEye
              sx={{ height: "iconSmall", mr: "small", width: "iconSmall" }}
            />
            Prévisualiser
          </Button>
        </Box>
      </div>
      <Dialog
        isOpen={showMarkdownPreview}
        onDismiss={() => setShowMarkdownPreview(false)}
        ariaLabel="Prévisualiser le rendu"
        sx={{
          left: "50%",
          margin: 0,
          maxHeight: "90vh",
          maxWidth: "50rem",
          overflow: "auto",
          position: "absolute",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
        }}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: micromark(markdown, "utf8", { allowDangerousHtml: true }),
          }}
        />
      </Dialog>
    </>
  );
};

MarkdownPreviewModal.propTypes = {
  markdown: PropTypes.string.isRequired,
};
