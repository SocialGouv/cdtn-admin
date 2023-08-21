import PropTypes from "prop-types";
import { useMemo } from "react";
import { useUser } from "src/hooks/useUser";
import { Card, Alert } from "@mui/material";
import { useMutation, useQuery } from "urql";

import { Stack } from "../layout/Stack";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { theme } from "src/theme";

const commentMutation = `
mutation insertNote($data: alert_notes_insert_input!) {
  insert_alert_notes_one(object:$data) {
    id, user {name}, created_at
  }
}
`;
const commentQuery = `
query getComments($alertId: uuid!) {
  comments: alert_notes(where: {alert_id: {_eq: $alertId}}, order_by:{created_at: asc}) {
    id, user {name}, createdAt:created_at, text:message
  }
}
`;

function Comments({ alertId }) {
  const [, postComment] = useMutation(commentMutation);
  const { user } = useUser();

  function sendComment(comment) {
    return postComment({
      data: {
        alert_id: alertId,
        message: comment,
        user_id: user.id,
      },
    });
  }
  const context = useMemo(() => ({ additionalTypenames: ["alert_notes"] }), []);

  const [results] = useQuery({
    context,
    query: commentQuery,
    variables: { alertId },
  });
  const { data, error, fetching } = results;
  if (fetching) return <Stack>chargement...</Stack>;
  if (error) {
    return (
      <Alert severity="error">
        <pre>{JSON.stringify(error, 0, null)}</pre>
      </Alert>
    );
  }
  return (
    <Stack gap="small">
      <CommentList comments={data.comments} />
      <CommentForm onSubmit={sendComment} />
    </Stack>
  );
}
Comments.propTypes = {
  alertId: PropTypes.string.isRequired,
};

function CommentsContainer({ alertId }) {
  return (
    <div style={{ position: "relative"}}>
      <Card
        style={{
          boxShadow: theme.space.large,
          flexDirection: "column",
          minWidth: "30rem",
          position: "absolute",
          right: "30px",
          padding: "20px",
        }}
      >
        <Comments alertId={alertId} />
      </Card>
    </div>
  );
}
CommentsContainer.propTypes = {
  alertId: PropTypes.string.isRequired,
};

export { CommentsContainer as Comments };
