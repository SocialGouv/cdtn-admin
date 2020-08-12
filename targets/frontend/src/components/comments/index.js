/** @jsx jsx */

import PropTypes from "prop-types";
import { useMemo } from "react";
import { getUserId } from "src/lib/auth/token";
import { Flex, jsx, Message } from "theme-ui";
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

export function Comments({ alertId }) {
  const [, postComment] = useMutation(commentMutation);
  const userId = getUserId();

  function sendComment(comment) {
    return postComment({
      data: {
        alert_id: alertId,
        message: comment,
        user_id: userId,
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
  if (fetching) return <p>loading</p>;
  if (error) {
    return (
      <Message>
        <pre>{JSON.stringify(error, 0, null)}</pre>
      </Message>
    );
  }
  console.log(data.comments);
  return (
    <div sx={{ position: "relative" }}>
      <Flex
        sx={{
          background: "white",
          borderRadius: "small",
          boxShadow: "medium",
          flexDirection: "column",
          minWidth: "30rem",
          padding: "small",
          position: "absolute",
          right: 0,
          top: "1em",
        }}
      >
        <Stack gap="small">
          <CommentList comments={data.comments} />
          <CommentForm onSubmit={sendComment} />
        </Stack>
      </Flex>
    </div>
  );
}

Comments.propTypes = {
  alertId: PropTypes.string.isRequired,
};
