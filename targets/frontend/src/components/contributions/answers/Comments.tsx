import SendIcon from "@mui/icons-material/Send";
import { AlertColor, Box, Button, FormControl } from "@mui/material";
import * as React from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormTextField } from "src/components/forms";
import { useUser } from "src/hooks/useUser";

import {
  AnswerStatus,
  Comments as AnswerComments,
  CommentsAndStatuses,
} from "../type";
import { Comment } from "./Comment";
import { MutationProps, useCommentsInsert } from "./comments.mutation";
import { SnackBar } from "../../utils/SnackBar";

type Props = {
  answerId: string;
  comments: AnswerComments[];
  statuses: AnswerStatus[];
};

function concatAndSort(
  comments: AnswerComments[],
  statuses: AnswerStatus[]
): CommentsAndStatuses[] {
  const all: ((AnswerStatus | AnswerComments) & {
    createdAtDate?: Date;
  })[] = [...comments, ...statuses];
  return all
    .map((notif) => {
      notif.createdAtDate = new Date(notif.createdAt);
      return notif as CommentsAndStatuses;
    })
    .sort((a, b) => {
      return a.createdAtDate.getTime() - b.createdAtDate.getTime();
    });
}

export const Comments = ({ answerId, comments, statuses }: Props) => {
  const { user }: any = useUser();

  const listRef = React.useRef<HTMLDivElement>(null);

  const insertComment = useCommentsInsert();

  const notifications: CommentsAndStatuses[] = useMemo(() => {
    return concatAndSort(comments, statuses);
  }, [comments, statuses]);

  const [snack, setSnack] = React.useState<{
    open: boolean;
    severity?: AlertColor;
    message?: string;
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
  }, [notifications]);

  const onSubmit = async (data: MutationProps) => {
    try {
      await insertComment(
        {
          answerId: answerId,
          content: data.content,
          userId: user.id,
        },
        { additionalTypenames: ["AnswerComments"] }
      );
      setSnack({
        open: true,
        severity: "success",
        message: "Le commentaire a été ajoutée",
      });
      resetField("content");
    } catch (e: any) {
      setSnack({ open: true, severity: "error", message: e.message });
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
            {notifications.map((comment) => (
              <Comment key={comment.id} comment={comment} />
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
      <SnackBar snack={snack} setSnack={setSnack}></SnackBar>
    </Box>
  );
};
