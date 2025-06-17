import SendIcon from "@mui/icons-material/Send";
import { AlertColor, Box, Button, FormControl } from "@mui/material";
import * as React from "react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { FormTextField } from "src/components/forms";
import { useSession } from "next-auth/react";

import {
  AnswerStatus,
  Comments as AnswerComments,
  CommentsAndStatuses,
} from "../type";
import { Comment } from "./Comment";
import {
  MutationProps,
  useCommentsDelete,
  useCommentsInsert,
} from "./comments.mutation";
import { SnackBar } from "../../utils/SnackBar";
import { ConfirmModal } from "src/modules/common/components/modals/ConfirmModal";

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
  const { data } = useSession();
  const user = data?.user;

  const listRef = React.useRef<HTMLDivElement>(null);

  const insertComment = useCommentsInsert();

  const deleteComment = useCommentsDelete();

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

  const [commentToDelete, setCommentToDelete] = React.useState<
    AnswerComments | undefined
  >();

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

  const onSubmit = async (_data: MutationProps) => {
    try {
      const result = await insertComment(
        {
          answerId: answerId,
          content: _data.content,
          userId: user?.id,
        },
        { additionalTypenames: ["AnswerComments"] }
      );
      if (result.error) {
        return setSnack({
          open: true,
          severity: "error",
          message: JSON.stringify(result.error),
        });
      }
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

  const onDeleteCom = async (_commentToDelete: AnswerComments) => {
    try {
      const result = await deleteComment(
        { id: _commentToDelete.id },
        {
          additionalTypenames: ["AnswerComments"],
        }
      );
      if (result.error) {
        throw new Error(JSON.stringify(result.error));
      }
      if (!result.data.delete_contribution_answer_comments_by_pk) {
        throw new Error("Impossible de supprimer ce commentaire...");
      }
      setSnack({
        open: true,
        severity: "success",
        message: "Le commentaire a bien été supprimé",
      });
      setCommentToDelete(undefined);
    } catch (e: any) {
      setCommentToDelete(undefined);
      setSnack({ open: true, severity: "error", message: e.message });
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      {commentToDelete && (
        <ConfirmModal
          open={!!commentToDelete}
          title="Suppression d'un commentaire"
          message={`Êtes-vous sur de vouloir supprimer le commentaire du "${commentToDelete.content}" ?`}
          onClose={() => setCommentToDelete(undefined)}
          onCancel={() => setCommentToDelete(undefined)}
          onValidate={() => {
            onDeleteCom(commentToDelete);
          }}
        />
      )}
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            paddingLeft: 4,
          }}
        >
          <Box
            mb={4}
            ref={listRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              maxHeight: "50vh",
              overflow: "auto",
            }}
          >
            {notifications.map((comment, index) => (
              <Comment
                key={index}
                comment={comment}
                onDelete={(c: AnswerComments) => {
                  setCommentToDelete(c);
                }}
              />
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
