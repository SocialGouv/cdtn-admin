import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AlertColor,
  Button,
  Card,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormSelect, FormTextField } from "src/components/forms";

import { useQuestionUpdateMutation } from "./Question.mutation";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Message, Question, questionRelationSchema } from "../type";
import { SnackBar } from "../../utils/SnackBar";

type EditQuestionProps = {
  question: Question;
  messages: Message[];
};

const formDataSchema = questionRelationSchema.pick({
  message_id: true,
  content: true,
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
    },
  });
  const [message, setMessage] = useState<Message | undefined>(undefined);
  const watchMessageId = watch("message_id", question.message?.id);
  const updateQuestion = useQuestionUpdateMutation();

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
      const result = await updateQuestion({ id: question.id, ...formData });
      if (result.error) {
        setSnack({
          message: `Erreur: ${result.error.message}`,
          open: true,
          severity: "error",
        });
      } else {
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
          />
          <Stack spacing={2}>
            <FormSelect
              options={messages.map((item) => ({
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
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>
                      Texte applicable en cas de réponse :
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <Typography>
                      Texte applicable si la convention collective ne prévoit
                      rien :
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: message.contentCdt }}
                    />
                  </AccordionDetails>
                </Accordion>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                  >
                    <Typography>
                      Texte applicable si la convention collective est non
                      traité / non disponible / inexistante :
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      dangerouslySetInnerHTML={{ __html: message.contentCdt }}
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
