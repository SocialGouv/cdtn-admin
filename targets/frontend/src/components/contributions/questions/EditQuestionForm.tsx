import { AlertColor, Button, Card, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FormSelect, FormTextField } from "src/components/forms";

import { useQuestionUpdateMutation } from "./Question.mutation";
import { Message, Question } from "../type";
import { SnackBar } from "../../utils/SnackBar";

type EditQuestionProps = {
  question: Question;
  messages: Message[];
};

type FormData = Omit<Question, "message"> & {
  message_id: string;
};

export const EditQuestionForm = ({
  question,
  messages,
}: EditQuestionProps): JSX.Element => {
  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      content: question.content,
      id: question.id,
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

  const onSubmit = async (data: FormData) => {
    try {
      const result = await updateQuestion(data);
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
            rules={{ required: true }}
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
              rules={{ required: true }}
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
                <Typography variant="subtitle1">Texte applicable</Typography>
                <Typography variant="body2">{message.content}</Typography>
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
