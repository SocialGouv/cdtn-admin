import {
  Alert,
  AlertColor,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FormSelect, FormTextField } from "src/components/forms";

import { useQuestionUpdateMutation } from "./Question.mutation";
import { Message, Question } from "./type";

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
  const router = useRouter();
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
          message: result.error.message,
          open: true,
          severity: "error",
        });
      } else {
        setSnack({ open: true, severity: "success" });
      }
    } catch (e) {
      setSnack({ open: true, severity: "error" });
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: 32 }}>
        <Grid container spacing={4} columns={1} direction="column">
          <Grid>
            <FormTextField
              name="content"
              control={control}
              label="Nom de la question"
              rules={{ required: true }}
              multiline
              fullWidth
            />
          </Grid>
          <Grid>
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
              <Paper
                elevation={3}
                style={{
                  background: "#f2f6fa",
                  marginLeft: 16,
                  marginRight: 16,
                  marginTop: 8,
                  padding: 16,
                }}
                variant={"outlined"}
              >
                <Typography variant="subtitle1">Texte applicable</Typography>
                <Typography variant="body2">{message.content}</Typography>
              </Paper>
            )}
          </Grid>
          <Grid display="flex" justifyContent="end">
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  router.back();
                }}
              >
                Annuler
              </Button>
              <Button variant="contained" type="submit">
                Sauvegarder
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack({ open: false })}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Alert
          onClose={() => setSnack({ open: false })}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack?.severity}
          {snack?.message ? `: ${snack.message}` : ""}
        </Alert>
      </Snackbar>
    </>
  );
};
