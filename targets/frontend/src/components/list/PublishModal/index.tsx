import { Alert, Box, Button, Modal, Stack, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { fr } from "@codegouvfr/react-dsfr";
import { usePublishMutation } from "../../../modules/documents/components/publish.mutation";
import { Source } from "../type";
import { useEffect, useState } from "react";
import { ListContent } from "./ListContent";

export type Content = {
  id: string;
  title: string;
};

export type PublishModalProps = {
  source: Source;
  contents: Content[];
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
};

type ContentProgression = {
  [id: string]: "pending" | "processing" | "done" | "error";
};

export function PublishModal({
  contents,
  open,
  onClose,
  onCancel,
  source,
}: PublishModalProps): JSX.Element {
  const publish = usePublishMutation();

  const [contentProgression, setContentProgression] =
    useState<ContentProgression>({});
  const [processing, setProcessing] = useState<"waiting" | "process" | "done">(
    "waiting"
  );

  useEffect(() => {
    setContentProgression(
      contents.reduce((acc, item) => {
        acc[item.id] = "pending";
        return acc;
      }, {} as ContentProgression)
    );
  }, [contents]);

  const onValidate = async () => {
    setProcessing("process");
    let currentProgression = contents.reduce((acc, item) => {
      acc[item.id] = "pending";
      return acc;
    }, {} as ContentProgression);
    for (const content of contents) {
      currentProgression = {
        ...currentProgression,
        [content.id]: "processing",
      };
      setContentProgression(currentProgression);
      try {
        const { data, error } = await publish({
          id: content.id,
          source: source,
        });

        if (error || data === undefined) {
          currentProgression = {
            ...currentProgression,
            [content.id]: "error",
          };
          setContentProgression(currentProgression);
        } else {
          currentProgression = {
            ...currentProgression,
            [content.id]: "done",
          };
          setContentProgression(currentProgression);
        }
      } catch (e) {
        currentProgression = {
          ...currentProgression,
          [content.id]: "error",
        };
        setContentProgression(currentProgression);
      }
    }
    setProcessing("done");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <StyledBox>
        <Typography variant="h4" component="h2" mb={4}>
          Publication de contenu
        </Typography>
        <Stack direction="column" spacing={2}>
          <p>
            Vous êtes sur le point de mettre à jour les {contents.length}{" "}
            contenus suivant.
          </p>
          <ListContent
            contents={contents.map((item) => ({
              ...item,
              status: contentProgression[item.id] ?? "pending",
            }))}
          />
          <p>
            Ces derniers seront disponible sur le site après une mise en
            production des données. Êtes-vous sûr de vouloir publier ces
            contenus ?
          </p>
        </Stack>
        <Stack direction="row" spacing={2} mt={4} justifyContent="end">
          {processing === "waiting" && (
            <Button variant="outlined" onClick={onCancel}>
              Annuler
            </Button>
          )}
          {processing === "waiting" && (
            <Button variant="contained" onClick={onValidate}>
              Oui
            </Button>
          )}
          {processing === "process" && (
            <Alert severity="warning">
              Merci de ne pas fermer cette fenêtre avant la fin de la mise à
              jour.
            </Alert>
          )}
          {processing === "done" && (
            <Button variant="outlined" onClick={onClose}>
              Fermer
            </Button>
          )}
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
