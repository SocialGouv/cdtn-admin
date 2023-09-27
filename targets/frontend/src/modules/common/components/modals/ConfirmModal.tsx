import { Box, Button, Modal, Stack } from "@mui/material";
import { styled } from "@mui/system";
import { fr } from "@codegouvfr/react-dsfr";

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
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={title}
      aria-describedby={message}
    >
      <StyledBox>
        <h2>{title}</h2>
        <p>{message}</p>
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button onClick={onCancel}>Annuler</Button>
          <Button onClick={onValidate}>Oui</Button>
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
  width: 400,
  backgroundColor: `${fr.colors.decisions.background.default.grey.default}`,
  border: `2px solid ${fr.colors.decisions.border.default.beigeGrisGalet.default}`,
  padding: "12px",
  borderRadius: "6px",
});
