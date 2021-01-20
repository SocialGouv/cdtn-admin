import micromark from "micromark";
import PropTypes from "prop-types";
import { useState } from "react";
import { IoIosEye } from "react-icons/io";
import { Button } from "src/components/button";
import { Dialog } from "src/components/dialog";
import { Flex } from "theme-ui";

export const MarkdownPreviewModal = ({ markdown }) => {
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  return (
    <>
      <Flex sx={{ justifyContent: "flex-end", mt: "xsmall" }}>
        <Button
          variant="secondary"
          type="button"
          size="small"
          onClick={() => setShowMarkdownPreview(true)}
        >
          <IoIosEye
            sx={{ height: "iconSmall", mr: "xsmall", width: "iconSmall" }}
          />
          Prévisualiser le rendu du markdown
        </Button>
      </Flex>
      <Dialog
        isOpen={showMarkdownPreview}
        onDismiss={() => setShowMarkdownPreview(false)}
        aria-label="Prévisualiser le rendu"
        sx={{
          left: "50%",
          margin: 0,
          maxHeight: "90vh",
          maxWidth: "50rem",
          overflow: "auto",
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
