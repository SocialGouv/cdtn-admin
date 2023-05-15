import SendIcon from "@mui/icons-material/Send";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  FormControl,
  Snackbar,
} from "@mui/material";
import * as React from "react";
import { useForm } from "react-hook-form";
import { FormTextField } from "src/components/forms";
import { useUser } from "src/hooks/useUser";
import { timeSince } from "src/lib/duration";

import { Comments as AnswerComments } from "../type";
import { MutationProps, useCommentsInsert } from "./Comments.mutation";

type Props = {
  answerId: string;
  comments: AnswerComments[];
};

export const Comments = (props: Props) => {
  const { user }: any = useUser();

  const listRef = React.useRef<HTMLDivElement>(null);

  const insertComment = useCommentsInsert();

  const [snack, setSnack] = React.useState<{
    open: boolean;
    severity?: AlertColor;
  }>({
    open: false,
  });

  const { control, handleSubmit, resetField } = useForm<MutationProps>({
    defaultValues: {
      content: "",
    },
  });

  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [props.comments]);

  const onSubmit = async (data: MutationProps) => {
    try {
      await insertComment({
        answerId: props.answerId,
        content: data.content,
        userId: user.id,
      });
      setSnack({ open: true, severity: "success" });
      resetField("content");
    } catch (e) {
      setSnack({ open: true, severity: "error" });
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: 4,
          }}
        >
          <Box
            ref={listRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              maxHeight: "50vh",
              overflow: "auto",
            }}
          >
            {props.comments.map((comment) => (
              <Box
                key={comment.id}
                sx={{
                  border: "1px solid",
                  borderColor: "grey.300",
                  borderRadius: "4px",
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: 2,
                  padding: 2,
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ fontWeight: "bold" }}>{comment.user.name}</Box>
                  <Box sx={{ color: "#6e6d6d", fontSize: "small" }}>
                    {timeSince(comment.createdAt ?? "")}
                  </Box>
                </Box>
                <Box sx={{ marginTop: 1 }}>{comment.content}</Box>
              </Box>
            ))}
          </Box>
          <FormControl>
            <FormTextField
              name="content"
              control={control}
              label="Commentez ici..."
              rules={{ required: true }}
              multiline
              fullWidth
            />
          </FormControl>
          <Button
            variant="contained"
            endIcon={<SendIcon />}
            type="submit"
            sx={{ marginTop: 1 }}
          >
            Envoyer
          </Button>
        </Box>
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
        </Alert>
      </Snackbar>
    </Box>
  );
};
