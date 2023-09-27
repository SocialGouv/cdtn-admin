import { Box, Button, Modal, Stack } from "@mui/material";
import { styled } from "@mui/system";

export type ConfirmModalProps = {
  open: boolean;
  message: string;
  title: string;
  onClose: () => void;
  onCancel: () => void;
  onValidate: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  onClose,
  onCancel,
  onValidate,
}: ConfirmModalProps): JSX.Element {
  return (
    <StyledModal
      open={open}
      onClose={onClose}
      aria-labelledby={title}
      aria-describedby={message}
    >
      <Box sx={{}}>
        <h2>{title}</h2>
        <p>{message}</p>
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button onClick={onCancel}>Annuler</Button>
          <Button onClick={onValidate}>Oui</Button>
        </Stack>
      </Box>
    </StyledModal>
  );
}

const StyledModal = styled(Modal)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  pt: 2,
  px: 4,
  pb: 3,
});
