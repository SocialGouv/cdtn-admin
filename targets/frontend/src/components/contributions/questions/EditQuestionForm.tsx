import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AlertColor,
  Button,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  styled,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import HelpIcon from "@mui/icons-material/Help";
import { z } from "zod";
import { FormSelect, FormTextField } from "src/components/forms";

import { useQuestionUpdateMutation } from "./Question.mutation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Message, Question, questionRelationSchema } from "../type";
import { SnackBar } from "../../utils/SnackBar";
import { usePublishAllAnswersMutation } from "../answers/usePublishAllAnswers";

type EditQuestionProps = {
  question: Question;
  messages: Message[];
};

const formDataSchema = z.object({
  message_id: questionRelationSchema.shape.message_id.or(z.literal("")),
  content: questionRelationSchema.shape.content,
  seo_title: questionRelationSchema.shape.seo_title,
});

export type FormData = z.infer<typeof formDataSchema>;

export const EditQuestionForm = ({
  question,
  messages,
}: EditQuestionProps): JSX.Element => {
  const { control, watch, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    shouldFocusError: true,
    defaultValues: {
      content: question.content,
      message_id: question.message?.id ?? "",
      seo_title: question.seo_title ?? "",
    },
  });
  const [message, setMessage] = useState<Message | undefined>(undefined);
  const watchMessageId = watch("message_id", question.message?.id);
  const updateQuestion = useQuestionUpdateMutation();
  const updateAllAnswers = usePublishAllAnswersMutation();

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

  const onSubmit = async (formData: FormData) => {
    try {
      const result = await updateQuestion({
        id: question.id,
        seo_title: formData.seo_title ?? undefined,
        content: formData.content,
        message_id: formData.message_id ? formData.message_id : undefined, // use to transform empty string sent by the form to undefined
      });
      if (result.error) {
        setSnack({
          message: `Erreur: ${result.error.message}`,
          open: true,
          severity: "error",
        });
      } else {
        updateAllAnswers(question.id);
        setSnack({ open: true, severity: "success", message: "Sauvegardé" });
      }
    } catch (e: any) {
      setSnack({
        open: true,
        severity: "error",
        message: `Erreur: ${e.message}`,
      });
    }
  };

  return (
    <Stack mt={4} spacing={2}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={4}>
          <FormTextField
            name="content"
            control={control}
            label="Nom de la question"
            multiline
            fullWidth
            disabled
          />
          <FormTextField
            name="seo_title"
            control={control}
            label="Nom SEO pour la question"
            multiline
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
            <Button variant="contained" type="submit">
              Sauvegarder
            </Button>
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
