import {
  Dialog as MuiDialog,
  DialogContent,
  IconButton as MuiIconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import { IoMdClose } from "react-icons/io";
import { Stack } from "../layout/Stack";

export function Dialog({
  ariaLabel,
  isOpen = false,
  onDismiss,
  children,
  ...props
}) {
  return (
    <MuiDialog
      open={isOpen}
      onClose={onDismiss}
      aria-label={ariaLabel}
      maxWidth="md"
      fullWidth
      {...props}
    >
      <DialogContent sx={{ position: "relative" }}>
        <MuiIconButton
          onClick={onDismiss}
          aria-label="Close"
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
          }}
        >
          <IoMdClose />
        </MuiIconButton>
        <Stack>{children}</Stack>
      </DialogContent>
    </MuiDialog>
  );
}

Dialog.propTypes = {
  ariaLabel: PropTypes.string,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func.isRequired,
};
