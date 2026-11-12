import React from "react";

import { Form, QuestionFormData } from "../common";
import {
  buildMessageLabel,
  decideMessageSave,
  pickMessageValues,
  shortId,
  toMessageContent,
} from "../common/messageBlock";
import {
  useQuestionMessageCreation,
  useQuestionMessageUpdate,
} from "./QuestionMessage.mutation";
import { useQuestionUpdateMutation } from "./Question.mutation";
import { useQuestionQuery } from "./Question.query";

export type EditQuestionProps = {
  questionId: string;
};

export const EditQuestion = ({
  questionId,
}: EditQuestionProps): JSX.Element => {
  const { data } = useQuestionQuery({ questionId });
  const updateQuestion = useQuestionUpdateMutation();
  const createMessage = useQuestionMessageCreation();
  const updateMessage = useQuestionMessageUpdate();

  const onUpdate = async (formData: QuestionFormData) => {
    const values = pickMessageValues(formData);
    const currentMessage = data?.question?.message;
    const action = decideMessageSave(values, currentMessage);

    let messageId: string | null = currentMessage?.id ?? null;
    switch (action.type) {
      case "create":
        // Pas de message, ou message partagé avec d'autres contributions :
        // une ligne propre est créée, les autres contributions ne changent pas.
        messageId = await createMessage({
          label: buildMessageLabel(formData.order, shortId()),
          ...toMessageContent(values),
        });
        break;
      case "update":
        await updateMessage(action.messageId, toMessageContent(values));
        messageId = action.messageId;
        break;
      case "detach":
        messageId = null;
        break;
      case "none":
        messageId = action.messageId;
        break;
    }

    await updateQuestion({
      id: questionId,
      seo_title: formData.seo_title ?? undefined,
      content: formData.content,
      message_id: messageId ?? undefined,
      introduction_nothing: formData.introduction_nothing || null,
      introduction_cdt: formData.introduction_cdt || null,
      template_answer: formData.template_answer || null,
    });
  };

  return (
    <>
      {data && data.question && (
        <Form question={data.question} onSubmit={onUpdate} />
      )}
    </>
  );
};
