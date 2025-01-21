import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AlertColor,
  Card,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import HelpIcon from "@mui/icons-material/Help";
import { z } from "zod";
import { FormSelect, FormTextField } from "src/components/forms";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Message, QuestionBase, questionRelationSchema } from "../../type";
import { SnackBar } from "../../../utils/SnackBar";
import { LoadingButton } from "../../../button/LoadingButton";

type EditQuestionProps = {
  question?: QuestionBase;
  messages: Message[];
  defaultOrder?: number;
  onSubmit: (props: QuestionFormData) => Promise<void>;
};

const formDataSchema = z.object({
  message_id: questionRelationSchema.shape.message_id.or(z.literal("")),
  content: questionRelationSchema.shape.content,
  seo_title: questionRelationSchema.shape.seo_title,
  order: questionRelationSchema.shape.order,
});

export type QuestionFormData = z.infer<typeof formDataSchema>;

export const Form = ({
  question,
  messages,
  defaultOrder,
  onSubmit,
}: EditQuestionProps): JSX.Element => {
  const { control, watch, handleSubmit } = useForm<QuestionFormData>({
    resolver: zodResolver(formDataSchema),
    shouldFocusError: true,
    defaultValues: {
      content: question?.content ?? "",
      message_id: question?.message_id ?? "",
      seo_title: question?.seo_title ?? "",
      order: question?.order ?? defaultOrder ?? -1,
    },
  });
  const [message, setMessage] = useState<Message | undefined>(undefined);
  const watchMessageId = watch("message_id", question?.message_id);
  const [submitting, setSubmit] = useState<boolean>(false);

  const [snack, setSnack] = useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
  }>({
    open: false,
  });

  useEffect(() => {
    if (watchMessageId) {
      const message = messages.find((message) => message.id === watchMessageId);
      setMessage(message);
    } else {
      setMessage(undefined);
    }
  }, [watchMessageId, messages]);

  const onSubmitForm = async (formData: QuestionFormData) => {
    setSubmit(true);
    try {
      await onSubmit(formData);
      setSnack({ open: true, severity: "success", message: "Sauvegardé" });
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: `Erreur: ${e.message}`,
      });
    }
    setSubmit(false);
  };

  return (
    <Stack mt={4} spacing={2}>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Stack spacing={4}>
          <FormTextField
            name="order"
            type="number"
            control={control}
            hintText={
              <>
                Cette valeur est indicative. Vous pouvez la modifier mais le
                numéro de question ne doit pas déjà être utilisée.{" "}
                <strong>
                  Il est recommandé de ne pas modifier la valeur par défaut.
                </strong>
              </>
            }
            label="Ordre"
            fullWidth
            disabled={question !== undefined}
          />
          <FormTextField
            name="content"
            control={control}
            label="Nom de la question"
            fullWidth
            disabled={question !== undefined}
          />
          <FormTextField
            name="seo_title"
            control={control}
            label="Nom SEO"
            hintText="Cette valeur va remplacer le nom du thème dans le titre de la page pour les contributions personnalisées. Laissez vide pour utiliser le thème de la question par défaut."
            fullWidth
          />
          <Stack spacing={2}>
            <FormSelect
              options={[{ label: "Aucun", id: "" }]
                .concat(messages)
                .map((item) => ({
                  label: item.label,
                  value: item.id,
                }))}
              name="message_id"
              control={control}
              label="Message associé à la question"
              fullWidth
            />
            {message && (
              <Card
                sx={{
                  background: "#f2f6fa",
                  padding: "16px",
                }}
                variant={"outlined"}
              >
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est traitée"
                    id="contentAgreement"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective est traitée
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentAgreement,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est non traitée, non sélectionnée ou si la réponse est dépubliée"
                    id="contentLegal"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective est non
                      traitée et n&apos;a pas de légal
                    </Typography>
                    <Tooltip title="Autres cas: non sélectionnée ou si la réponse est dépubliée">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentAgreementWithoutLegal,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective ne prévoit rien"
                    id="contentUnplanned"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective ne prévoit
                      rien
                    </Typography>
                    <Tooltip title="Autres cas: renvoie au Code du Travail ou est intégralement moins favorable que le Code du Travail">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentNotHandled,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est non traitée, non sélectionnée ou si la réponse est dépubliée"
                    id="contentLegal"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective ne prévoit
                      rien et n&apos;a pas de légal
                    </Typography>
                    <Tooltip title="Autres cas: non sélectionnée ou si la réponse est dépubliée">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: message.contentNotHandledWithoutLegal,
                      }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="Texte applicable si la convention collective est non traitée, non sélectionnée ou si la réponse est dépubliée"
                    id="contentLegal"
                  >
                    <Typography fontWeight={600}>
                      Texte applicable si la convention collective est non
                      traitée
                    </Typography>
                    <Tooltip title="Autres cas: non sélectionnée ou si la réponse est dépubliée">
                      <StyledIconButton>
                        <HelpIcon />
                      </StyledIconButton>
                    </Tooltip>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: message.contentLegal }}
                    />
                  </AccordionDetails>
                </Accordion>
              </Card>
            )}
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="end">
            <LoadingButton
              variant="contained"
              loading={submitting}
              type="submit"
            >
              {question ? "Sauvegarder" : "Créer"}
            </LoadingButton>
          </Stack>
        </Stack>
      </form>
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </Stack>
  );
};

const StyledIconButton = styled(IconButton)(() => {
  return {
    padding: 0,
    marginLeft: "8px",
  };
});
