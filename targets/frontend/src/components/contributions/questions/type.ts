export type QuestionEntity = {
  id: string;
  content: string;
  message?: MessageEntity;
  __typename: string;
};

export type MessageEntity = {
  id: string;
  label: string;
  content: string;
  __typename: string;
};

export type Message = Omit<MessageEntity, "__typename">;

export type Question = Omit<QuestionEntity, "__typename">;

export type QuestionWithMessages = {
  question: Question;
  messages: Message[];
};
