import { Box, Button, Modal, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { fr } from "@codegouvfr/react-dsfr";

export type ConfirmModalProps = {
  open: boolean;
  message: JSX.Element | string;
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
    <Modal open={open} onClose={onClose} aria-labelledby={title}>
      <StyledBox>
        <Typography id="modal-modal-title" variant="h4" component="h2" mb={4}>
          {title}
        </Typography>
        {message}
        <Stack direction="row" spacing={2} mt={4} justifyContent="end">
          <Button variant="outlined" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant="contained" onClick={onValidate}>
            Oui
          </Button>
        </Stack>
      </StyledBox>
    </Modal>
  );
}

const StyledBox = styled(Box)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  backgroundColor: `${fr.colors.decisions.background.default.grey.default}`,
  padding: `${fr.spacing("8v")}`,
});
