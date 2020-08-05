/** @jsx jsx */

import { Dialog as ReachDialog } from "@reach/dialog";
import VisuallyHidden from "@reach/visually-hidden";
import PropTypes from "prop-types";
import { IoMdClose } from "react-icons/io";
import { css, jsx } from "theme-ui";

import { IconButton } from "../button";
import { Stack } from "../layout/Stack";

export function Dialog({ isOpen = false, onDismiss, children }) {
  return (
    <ReachDialog css={styles.dialog} isOpen={isOpen} onDismiss={onDismiss}>
      <IconButton css={styles.closeBt} variant="secondary" onClick={onDismiss}>
        <VisuallyHidden>Close</VisuallyHidden>
        <IoMdClose />
      </IconButton>
      <Stack>{children}</Stack>
    </ReachDialog>
  );
}

const styles = {
  closeBt: css({
    position: "absolute",
    right: "xxsmall",
    top: "xxsmall",
  }),
  dialog: css({
    position: "relative",
  }),
};

Dialog.propTypes = {
  children: PropTypes.nodes,
  isOpen: PropTypes.bool,
  onDismiss: PropTypes.func.isRequired,
};
