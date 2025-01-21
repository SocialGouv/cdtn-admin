import React from "react";

import { Form, QuestionFormData } from "../common";
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

  const onUpdate = async (formData: QuestionFormData) => {
    await updateQuestion({
      id: questionId,
      seo_title: formData.seo_title ?? undefined,
      content: formData.content,
      message_id: formData.message_id ? formData.message_id : undefined, // use to transform empty string sent by the form to undefined
    });
  };

  return (
    <>
      {data && data.question && (
        <Form
          question={data.question}
          messages={data.messages}
          onSubmit={onUpdate}
        />
      )}
    </>
  );
};
