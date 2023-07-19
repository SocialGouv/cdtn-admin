import React from "react";
import { Paper, Typography, TextField } from "@mui/material";
import { Button } from "theme-ui";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";

const classes = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  chatContainer: {
    flexGrow: 1,
    overflow: "auto",
    padding: "1rem",
  },
  message: {
    marginBottom: "1rem",
  },
  inputContainer: {
    display: "flex",
    padding: "1rem",
  },
  input: {
    flexGrow: 1,
    marginRight: "1rem",
  },
  refContainer: {
    maxHeight: "20vh",
    overflow: "auto",
    padding: "1rem",
  },
} as const;

type Answer = {
  text: string;
  sourceDocuments: SourceDocument[];
};

type SourceDocument = {
  pageContent: string;
  metadata: Metadata;
};

type Metadata = {
  title: string;
  metaDescription: string;
};

type ChatMessage = ChatbotResponse | HumanResponse;

type ChatbotResponse = {
  type: "chatbot";
  message: string;
  sourceDocuments: SourceDocument[];
};

type HumanResponse = {
  type: "human";
  message: string;
};

type PageProps = {
  references: Metadata[];
};

const ChatPage = ({
  references,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      type: "chatbot",
      message:
        "Bonjour, je suis le chatbot du CDTN. Comment puis-je vous aider ?",
      sourceDocuments: [],
    },
  ]);
  const [message, setMessage] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onSendMessage = async () => {
    if (isLoading || message === "") return;
    setIsLoading(true);
    const msg: ChatMessage[] = [
      ...messages,
      {
        type: "human",
        message: message,
      },
    ];
    setMessage("");
    setMessages(msg);
    const historyMessages = msg.reduce((acc, curr) => acc + curr.message, "");

    const response = await fetch("http://localhost:8787/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: message, history: historyMessages }),
    });
    const data: Answer = await response.json();
    setMessages([
      ...msg,
      {
        type: "chatbot",
        message: data.text,
        sourceDocuments: data.sourceDocuments,
      },
    ]);
    setIsLoading(false);
  };

  return (
    <div style={classes.root}>
      {references.length > 0 && (
        <Paper style={classes.refContainer}>
          <Typography variant="h6">Références</Typography>
          <ul>
            {references.map((reference, index) => {
              return (
                <li key={index}>
                  <Typography variant="subtitle1">{reference.title}</Typography>
                  <Typography variant="body2">
                    {reference.metaDescription}
                  </Typography>
                </li>
              );
            })}
          </ul>
        </Paper>
      )}
      <Paper style={classes.chatContainer}>
        <Typography variant="h6">Chat</Typography>
        {messages.map((msg, index) => {
          return (
            <div key={index} style={classes.message}>
              <Typography
                variant="subtitle1"
                style={{
                  fontWeight: "bold",
                }}
              >
                {msg.type === "chatbot" ? "CDTN Bot" : "Moi"}
              </Typography>
              <Typography variant="body1">{msg.message}</Typography>
              {msg.type === "chatbot" && msg.sourceDocuments.length > 0 && (
                <div>
                  <Typography variant="body1">
                    Ci-dessous vous trouverez les infos qui m&apos;ont permis de
                    répondre à la question :
                  </Typography>
                  <ul>
                    {msg.sourceDocuments.map((sourceDocument, index) => {
                      return (
                        <li key={index}>
                          <Typography variant="subtitle1">
                            {sourceDocument.metadata.title}
                          </Typography>
                          <Typography variant="body2">
                            {sourceDocument.metadata.metaDescription}
                          </Typography>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <>
            <Typography
              variant="subtitle1"
              style={{
                fontWeight: "bold",
              }}
            >
              CDTN Bot
            </Typography>
            <Typography variant="body1">Je réfléchis...</Typography>
          </>
        )}
      </Paper>
      <div style={classes.inputContainer}>
        <TextField
          style={classes.input}
          label="Type your message"
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSendMessage();
            }
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={onSendMessage}
          disabled={isLoading}
        >
          🚀🚀🚀
        </Button>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const response = await fetch("http://localhost:8787/embedding/list");
  const data: Metadata[] = await response.json();
  return { props: { references: data } };
};

export default ChatPage;
