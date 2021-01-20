/** jsxImportSource theme-ui */
import PropTypes from "prop-types";
import { useMemo } from "react";
import { useUser } from "src/hooks/useUser";
import { Card, Message } from "theme-ui";
import { useMutation, useQuery } from "urql";

import { Stack } from "../layout/Stack";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

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

function CommentsContainer({ alertId }) {
  return (
    <div sx={{ position: "relative" }}>
      <Card
        sx={{
          background: "white",
          boxShadow: "large",
          flexDirection: "column",
          minWidth: "30rem",
          position: "absolute",
          right: 0,
          top: "1em",
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
      <Message>
        <pre>{JSON.stringify(error, 0, null)}</pre>
      </Message>
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

export { CommentsContainer as Comments };
