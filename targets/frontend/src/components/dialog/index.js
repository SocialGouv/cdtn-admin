import { Dialog as ReachDialog } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import PropTypes from "prop-types";
import { IoMdClose } from "react-icons/io";
import { IconButton } from "../button";
import { Stack } from "../layout/Stack";

export function Dialog({
  ariaLabel,
  isOpen = false,
  onDismiss,
  children,
  ...props
}) {
  return (
    <ReachDialog
      css={styles.dialog}
      isOpen={isOpen}
      onDismiss={onDismiss}
      aria-label={ariaLabel}
      {...props}
    >
      <IconButton css={styles.closeBt} variant="secondary" onClick={onDismiss}>
        <VisuallyHidden>Close</VisuallyHidden>
        <IoMdClose />
      </IconButton>
      <Stack>{children}</Stack>
    </ReachDialog>
  );
}

const styles = {
  closeBt: {
    position: "absolute",
    right: "xxsmall",
    top: "xxsmall",
  },
  dialog: {
    position: "relative",
  },
};

Dialog.propTypes = {
  ariaLabel: PropTypes.string,
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func.isRequired,
};
