import React from "react";
import { Paper, Typography, TextField } from "@mui/material";
import { Button } from "theme-ui";

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
  text: string;
  metadatas: Metadata;
};

type Metadata = {
  title: string;
  metaDescription: string;
  id: string;
  numChunks?: number;
  idccNumber?: string;
};

type ChatMessage = ChatbotResponse | HumanResponse;

type ChatbotResponse = {
  role: "system" | "assistant";
  content: string;
  sourceDocuments: SourceDocument[];
};

type HumanResponse = {
  role: "user";
  content: string;
};

const ChatPage = () => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Bonjour, je suis le chatbot du CDTN. Comment puis-je vous aider ?",
      sourceDocuments: [],
    },
  ]);
  const [history, setHistory] = React.useState<Partial<ChatMessage>[]>([]);
  const [message, setMessage] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [idccNumber, setIdccNumber] = React.useState<string | undefined>(
    undefined
  );
  const [collectionName, setCollectionName] = React.useState<
    "chat/service-public" | "chat/contribution-generic"
  >("chat/service-public");

  const onSendMessage = async () => {
    if (isLoading || message === "") return;
    setIsLoading(true);
    const messageWritten = message;
    const msg: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: messageWritten,
      },
    ];
    setMessage("");
    setMessages(msg);

    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: messageWritten,
        history: history,
        idcc: idccNumber,
        url: "http://localhost:8787/" + collectionName,
      }),
    });

    const data: Answer = await response.json();
    setMessages([
      ...msg,
      {
        role: "assistant",
        content: data.text,
        sourceDocuments: data.sourceDocuments,
      },
    ]);
    setHistory([
      ...history,
      {
        role: "user",
        content: messageWritten,
      },
      {
        role: "assistant",
        content: data.text,
      },
    ]);
    setIsLoading(false);
  };

  return (
    <div style={classes.root}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => window.location.reload()}
        style={{
          color: "white",
        }}
      >
        Relancer la conversation
      </Button>
      <div>
        <label htmlFor="collectionName">Collection : </label>
        <select
          name="collectionName"
          id="collectionName"
          onChange={(e) => setCollectionName(e.target.value as any)}
          value={collectionName}
        >
          <option value="chat/service-public">Service Public</option>
          <option value="chat/contribution-generic">Contribution</option>
        </select>
      </div>
      {collectionName === "chat/contribution-generic" && (
        <div>
          <label htmlFor="idccNumber">IDCC : </label>
          <input
            type="text"
            name="idccNumber"
            id="idccNumber"
            onChange={(e) => setIdccNumber(e.target.value)}
            value={idccNumber}
            placeholder="ex: 0834, 0016, etc."
          />
        </div>
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
                {msg.role === "system" || msg.role === "assistant"
                  ? "CDTN Bot"
                  : "Moi"}
              </Typography>
              <Typography variant="body1">{msg.content}</Typography>
              {msg.role === "system" ||
                (msg.role === "assistant" && msg.sourceDocuments.length > 0 && (
                  <div>
                    <Typography variant="body1">
                      Ci-dessous vous trouverez les infos qui m&apos;ont permis
                      de répondre à la question :
                    </Typography>
                    <ul>
                      {msg.sourceDocuments.map((sourceDocument, index) => {
                        return (
                          <li key={index}>
                            <Typography variant="subtitle1">
                              {sourceDocument.metadatas.title}
                            </Typography>
                            <Typography variant="body2">
                              {sourceDocument.metadatas.metaDescription}
                            </Typography>
                            {sourceDocument.metadatas.idccNumber && (
                              <Typography variant="body2">
                                IDCC : {sourceDocument.metadatas.idccNumber}
                              </Typography>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
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

export default ChatPage;
